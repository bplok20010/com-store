import React from "react";
import invariant from "invariant";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

// TODO: ts类型编写

export const version = "%VERSION%";

const ROOT_STATE = "__$$$ROOT_STATE_0eed#0$KLU%^1$$$___";

//////////////////////////types//////////////////////////

export interface IViewModel {
	state: any;
	actions?: {
		[x: string]: (this: Store, ...args: any[]) => void;
	};
	models?: {
		[name: string]: {
			state: any;
			actions?: {
				[x: string]: (this: Store, ...args: any[]) => void;
			};
		};
	};
}

export type Update<T = {}> = <K extends keyof T>(
	state: ((prevState: Readonly<T>) => Pick<T, K> | T | null) | Pick<T, K> | T | null
) => void;
export type Subscriber<T = {}> = (prevState: Readonly<T>, nextState: Readonly<T>) => void;
export type UseSelector<T = {}> = <S extends (state: T) => any>(selector: S) => ReturnType<S>;
export type UseProvider<T> = () => Provider<T>;
export type Consumer<T = {}> = React.FC<ConsumerProps<T>>;
export type Context<T> = React.Context<T>;
export type ReducerAction = {
	type: string;
	[x: string]: any;
};
export type Reducer<T> = (state: T, action: ReducerAction) => T;
export type Dispatch = (action: ReducerAction) => void;
export type UseDispatch = () => Dispatch;
export interface ConsumerProps<T = {}> {
	children: (state: T) => React.ReactElement | null;
}

interface ProviderProps<T> {
	initialValue?: T;
	setup?: (opts: { state: T; setState: (value: any) => void }) => void;
}
interface ProviderState<T> {
	// value: Readonly<T>;
}

// ViewModelProvider
export interface Provider<T = {}> extends React.Component<ProviderProps<T>, ProviderState<T>> {
	__$isProvider: boolean;
	getSubscribeCount(): number;
	subscribe(subscriber: Subscriber<T>): () => void;
	getState(): T;
	getActions(): any;
}

export interface Store<T = {}> {
	Context: Context<T>;
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useStore: UseProvider<T>;
	useSelector: UseSelector<T>;
	useActions: any;
	connect: any;
}

export interface ReducerStore<T = {}> extends Store<T> {
	useDispatch: UseDispatch;
}

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

const errorMsg = "You may forget to use the <Store.Provider> package component";

function assertProvider(provider: Provider) {
	invariant(provider.__$isProvider, errorMsg);
}

export type ActionCallback<T> = (
	this: Store<T>,
	value: any,
	opt?: {
		state: T;
		setState: () => void;
		actions: {};
		dispatch: (name: string, value: any) => void;
	}
) => any;

export interface StoreOptions<U extends ActionCallback<any>> {
	namespace?: string;
	actions?: U;
}

class ViewModel {
	name: any;
	get state() {
		return this._provider.getState();
	}
	actions: any = {};

	protected _provider: any;

	constructor({ name, actions, provider }) {
		this.name = name;
		this._provider = provider;

		if (actions) {
			Object.keys(actions).forEach(name => {
				this.actions[name] = actions[name].bind(this);
			});
		}
	}

	setState = (state, cb) => {
		this._provider.setState(state, () => cb?.(this._provider.getState()));
	};
}

function getInitialState(store) {
	const state = typeof store.state === "function" ? store.state() : store.state;

	const initialState = {
		...state,
	};

	if (store.stores) {
		Object.keys(store.stores).forEach(name => {
			initialState[name] = store.stores![name].state;
		});
	}

	return initialState;
}

export function createStore<
	T extends Record<string | number | symbol, any>,
	U extends ActionCallback<any>
>(store: IViewModel): Store<T> {
	const initialState = getInitialState(store);
	const StoreContext = React.createContext<Provider<T>>({
		state: initialState,
	} as Provider<T>);
	const StateContext = React.createContext<T>(initialState as T);

	const Provider = class extends React.Component<ProviderProps<T>, ProviderState<T>> {
		// static displayName = options.namespace;
		store: ViewModel;
		protected _listeners: Subscriber<T>[] = [];
		__$isProvider = true;

		state = getInitialState(store);

		componentDidMount() {
			// this.props.setup?.(this.store);
		}

		constructor(props: any) {
			super(props);

			const actions = {};

			if (store.models) {
				Object.keys(store.models).forEach(name => {
					const getState = () => this.getState()[name];
					const setState = (state, cb) =>
						this.setState(
							{
								[name]: {
									...getState(),
									...state,
								},
							},
							cb
						);

					const m = store.models![name];
					const subModel = new ViewModel({
						name,
						actions: m.actions,
						provider: {
							getState,
							setState,
						},
					});

					actions[name] = subModel.actions;
				});
			}

			this.store = new ViewModel({
				name: ROOT_STATE,
				actions: {
					...store.actions,
					...actions,
				},
				provider: {
					getState: this.getState.bind(this),
					setState: this.setState.bind(this),
				},
			});
		}

		getSubscribeCount() {
			return this._listeners.length;
		}

		getActions() {
			return this.store.actions;
		}

		getState() {
			return this.state;
		}

		setState<K extends keyof T>(state: any, callback?: () => void) {
			const prevState = this.getState();
			super.setState(state, () => {
				this._listeners.forEach(listener => {
					listener(prevState, this.getState());
				});

				callback && callback();
			});
		}

		subscribe(subscriber: Subscriber<T>): () => void {
			this._listeners.push(subscriber);
			return () => {
				const idx = this._listeners.indexOf(subscriber);
				if (idx > -1) {
					this._listeners.splice(idx, 1);
				}
			};
		}

		componentWillUnmount() {
			this._listeners.length = 0;
		}

		render() {
			return (
				<StateContext.Provider value={this.state}>
					<StoreContext.Provider value={this}>{this.props.children}</StoreContext.Provider>
				</StateContext.Provider>
			);
		}
	};

	const Consumer: Consumer<T> = function (props) {
		const provider = React.useContext(StoreContext);
		assertProvider(provider);

		const [state, setState] = React.useState(provider.getState());

		assertProvider(provider);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return props.children(state);
	};

	const useProvider: UseProvider<T> = function () {
		const provider = React.useContext(StoreContext);

		assertProvider(provider);

		return provider;
	};

	const useSelector: UseSelector<T> = function useSelector(selector) {
		const provider = React.useContext(StoreContext);
		assertProvider(provider);

		const [state, setState] = React.useState(selector(provider.getState()));

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				const newState = selector(nextState);
				if (!shallowEqual(state, newState)) {
					setState(newState);
				}
			});
		});

		return state;
	};

	const useActions = function () {
		const provider = React.useContext(StoreContext);
		assertProvider(provider);

		return provider.getActions();
	};

	// connect(mapStateToProps, mapActionToProps)(Component)
	const connect = function (
		mapStateToProps?: (state: T, props: any) => {},
		mapActionToProps?: (actions: U, props: any) => {}
	) {
		return function (Component: React.ElementType) {
			return function WrappedComponent(props: any) {
				const provider = React.useContext(StoreContext);
				assertProvider(provider);

				const stateToProps = useSelector(state => mapStateToProps?.(state, props));

				return (
					<>
						<Component
							{...props}
							{...stateToProps}
							{...mapActionToProps?.(provider.getActions(), props)}
						/>
					</>
				);
			};
		};
	};

	return {
		Context: StateContext,
		Provider,
		Consumer,
		useStore: useProvider,
		useSelector,
		useActions,
		connect,
	};
}
