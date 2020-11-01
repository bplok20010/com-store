import React from "react";
import invariant from "invariant";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

// TODO: ts类型编写

export const version = "%VERSION%";

//////////////////////////types//////////////////////////
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
}
interface ProviderState<T> {
	value: Readonly<T>;
}

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
	useDispatch: any;
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

// TODO: 选择
// actions: {
//   [x: string]: Reducer
// }
// 或者
// actions: {
//   [x: string]: Effect
// }
// 或者
// {
//   reducers: {},
//   effects: {}
// }

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

// TODO:
// 参1数为Object时，支持多状态合并？
// {
//   state1:  {
//     initialState: {}
//     actions: {}
//     namespace: string
//     ...
//   },
//   state2: {...},
//   ...
// }
export function createStore<
	T extends Record<string | number | symbol, any>,
	U extends ActionCallback<any>
>(initialValue: T extends () => any ? () => T : T, options: StoreOptions<U> = {}): Store<T> {
	const getInitialValue = (): T => {
		return typeof initialValue === "function" ? initialValue() : initialValue;
	};
	const StoreContext = React.createContext<Provider<T>>({
		state: {
			value: getInitialValue(),
		},
	} as Provider<T>);
	const StateContext = React.createContext<T>({} as T);

	const actions = options?.actions || {};
	const wrappedActions = {};

	Object.keys(actions).forEach(name => {
		wrappedActions[name] = function (value: any, store) {
			actions[name].call(store, value, {
				state: store.getState(),
				setState: value => store.setState(value),
				actions,
			});
		};
	});

	const Provider = class extends React.Component<ProviderProps<T>, ProviderState<T>> {
		static displayName = options.namespace;
		actions: {};
		protected _listeners: Subscriber<T>[] = [];
		__$isProvider = true;

		constructor(props: any) {
			super(props);

			const actions = {};

			Object.keys(wrappedActions).forEach(name => {
				actions[name] = (value: any) => {
					wrappedActions[name](value, this);
				};
			});

			this.actions = actions;
		}

		getSubscribeCount() {
			return this._listeners.length;
		}

		state: {
			value: Readonly<T>;
		} = {
			value: this.props.initialValue || getInitialValue(),
		};

		getActions() {
			return this.actions;
		}

		getState() {
			return this.state.value;
		}

		setState<K extends keyof T>(state: any, callback?: () => void) {
			const prevState = this.state;
			super.setState(
				{
					value: state,
				},
				() => {
					this._listeners.forEach(listener => {
						listener(prevState.value, this.state.value);
					});

					callback && callback();
				}
			);
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
				<StateContext.Provider value={this.state.value}>
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

	const useDispatch = function () {
		const provider = React.useContext(StoreContext);
		assertProvider(provider);

		const actions = provider.getActions();

		return React.useCallback(
			(name: keyof U, value: any) => {
				if (actions[name]) {
					return actions[name](value);
				}
			},
			[provider]
		);
	};

	// connect(mapStateToProps, mapActionToProps)(Component)
	const connect = function (
		mapStateToProps?: (state: T, props: any) => {},
		mapActionToProps?: (actions: U, props: any) => {}
	) {
		const provider = React.useContext(StoreContext);
		assertProvider(provider);

		const connect = function (Component: React.ElementType) {
			return function WrappedComponent(props: {}) {
				return (
					<>
						<Component
							{...props}
							{...mapStateToProps?.(provider.getState(), props)}
							{...mapActionToProps?.(provider.getActions(), props)}
						/>
					</>
				);
			};
		};

		return connect;
	};

	return {
		Context: StateContext,
		Provider,
		Consumer,
		useStore: useProvider,
		useSelector,
		useActions,
		useDispatch,
		connect,
	};
}
