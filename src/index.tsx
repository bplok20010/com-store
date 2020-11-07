import React from "react";
import invariant from "invariant";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

export const version = "%VERSION%";

const ROOT_STATE = "__$$$ROOT_STATE_0eed#0$KLU%^1$$$___";

//////////////////////////types//////////////////////////

interface ViewModelCore {
	state: Record<any, any> | (() => Record<any, any>);
	actions: Record<string, (this: Store<any>, ...args: any[]) => any>;
}

interface ViewModelInner<T extends ViewModelCore> {
	state: T["state"];
	actions?: T["actions"];
}

export interface IViewModel<T extends ViewModelCore = ViewModelCore> {
	state: T["state"] extends () => any ? ReturnType<T["state"]> : T["state"];
	actions?: T["actions"];
	stores?: ViewModelInner<T>;
}

export type Subscriber<T extends IViewModel> = (
	prevState: Readonly<ProviderState<T>>,
	nextState: Readonly<ProviderState<T>>
) => void;
export type UseSelector<T extends IViewModel> = <S extends (state: T) => any>(
	selector: S
) => ReturnType<S>;
export type UseProvider<T extends IViewModel> = () => Store<T>;
export type Consumer<T extends IViewModel> = React.FC<ConsumerProps<T>>;
export type Context<T extends IViewModel> = React.Context<ProviderState<T>>;

export interface ConsumerProps<T extends IViewModel> {
	children: (state: T) => React.ReactElement | null;
}

interface ProviderProps<T extends IViewModel> {
	initialState?: GetStateType<T["state"]>;
	setup?: (this: Store<T>) => void;
}

type ProviderState<T extends IViewModel> = GetStateType<T["state"]> &
	{
		[K in keyof T["state"]]: T["state"][K];
	};

export interface Store<T extends IViewModel> {
	state: ProviderState<T>;
	__$isProvider: boolean;
	subscribe(subscriber: Subscriber<T>): () => void;
	getState(): ProviderState<T>;
	getActions(): T["actions"];
	setState(data: T["state"], cb?: () => void): void;
}

export interface StoreContext<T extends IViewModel> {
	Context: Context<T>;
	Provider: React.ElementType<ProviderProps<T>>;
	Consumer: Consumer<T>;
	useStore: UseProvider<T>;
	useSelector: UseSelector<T>;
	useActions: any;
	connect: any;
}

type GetStateType<T> = T extends () => any ? ReturnType<T> : T;

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

const errorMsg = "You may forget to use the <Store.Provider> package component";

function assertProvider(provider: any) {
	invariant(provider.__$isProvider, errorMsg);
}

function getInitialState<T extends IViewModel>(store: T): ProviderState<T> {
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

class ViewModel {
	name: string;
	get state() {
		return this._provider.getState();
	}
	actions: Record<string, (this: ViewModel, ...args: any[]) => any> = Object.create(null);

	protected _provider: any;

	constructor({
		name,
		actions,
		provider,
	}: {
		name: string;
		actions: Record<string, (this: ViewModel, ...args: any[]) => any>;
		provider: {
			getState: () => any;
			setState: (state: any, cb: () => void) => void;
		};
	}) {
		this.name = name;
		this._provider = provider;

		if (actions) {
			Object.keys(actions).forEach(name => {
				this.actions[name] = actions[name].bind(this);
			});
		}
	}

	setState = (state: any, cb: () => void) => {
		this._provider.setState(state, cb);
	};
}

export function createStore<T extends IViewModel>(store: T): StoreContext<T> {
	const initialState = getInitialState(store);
	// TODO:
	const StoreContext = React.createContext({
		state: initialState,
		getState: () => initialState,
		setState() {},
		getActions() {
			return {};
		},
		subscribe() {
			return function () {};
		},
		__$isProvider: false,
	} as Store<T>);
	const StateContext = React.createContext(initialState);

	const Provider = class extends React.Component<ProviderProps<T>, ProviderState<T>> {
		protected _listeners: Subscriber<T>[] = [];
		__$isProvider = true;

		store: any;

		state: ProviderState<T> = getInitialState(store);

		componentDidMount() {
			// TODO:
			// this.props.setup?.(this.store);
		}

		constructor(props: any) {
			super(props);

			const actions = {};

			if (store.stores) {
				Object.keys(store.stores).forEach(name => {
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

					const m = store.stores![name];
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
			return this.state as Readonly<ProviderState<T>>;
		}

		setState<K extends keyof ProviderState<T>>(
			state:
				| ((
						prevState: Readonly<ProviderState<T>>,
						props: Readonly<ProviderProps<T>>
				  ) => Pick<ProviderState<T>, K> | ProviderState<T> | null)
				| (Pick<ProviderState<T>, K> | ProviderState<T> | null),
			callback?: () => void
		) {
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
					<StoreContext.Provider value={(this as unknown) as Store<T>}>
						{this.props.children}
					</StoreContext.Provider>
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
				setState(nextState as ProviderState<T>);
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
		mapActionToProps?: (actions: any, props: any) => {}
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
