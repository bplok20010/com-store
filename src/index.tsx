import React from "react";
import invariant from "invariant";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";
import {
	StoreOptions,
	ProviderState,
	StoreContext,
	Store,
	ProviderProps,
	Subscriber,
	BaseStore,
	Consumer,
	UseStore,
	UseActions,
	UseSelector,
} from "./types";

export const version = "%VERSION%";

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

const errorMsg = "You may forget to use the <Store.Provider> package component";

function assertProvider(provider: any) {
	invariant(provider.__$isProvider, errorMsg);
}

function getInitialState<T extends StoreOptions>(store: T): ProviderState<T> {
	return typeof store.state === "function" ? store.state() : store.state;
}

export function createStore<T extends StoreOptions>(store: T): StoreContext<T> {
	const initialState = getInitialState(store);
	const actions = store.actions || {};

	const StoreContext = React.createContext<Store<T>>(({
		...actions,
		__$isProvider: false,
		state: initialState,
		setState() {
			throw errorMsg;
		},
		subscribe() {
			throw errorMsg;
		},
	} as unknown) as Store<T>);
	const StateContext = React.createContext(initialState);

	function mapActions<A, S>(actions: A, store: S): A {
		const bindActions = {} as A;

		Object.keys(actions).forEach(name => {
			bindActions[name] = actions[name].bind(store);
		});

		return bindActions;
	}

	const Provider = class extends React.Component<ProviderProps<T>, ProviderState<T>> {
		protected _listeners: Subscriber<T>[] = [];

		store: Store<T>;

		state: ProviderState<T> = getInitialState(store);

		componentDidMount() {
			if (this.props.setup) {
				this.props.setup.call(this.store, this.getState());
			}
		}

		constructor(props: any) {
			super(props);
			const self = this;

			const ctx: BaseStore<T> = {
				get __$isProvider() {
					return true;
				},
				get state() {
					return self.state;
				},
				get setState() {
					return self.setState.bind(self);
				},
				get subscribe() {
					return self.subscribe.bind(self);
				},
			};

			this.store = {
				...mapActions(actions, ctx),
				...ctx,
			} as Store<T>;
		}

		getState() {
			return this.state;
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
					<StoreContext.Provider value={this.store}>{this.props.children}</StoreContext.Provider>
				</StateContext.Provider>
			);
		}
	};

	const Consumer: Consumer<T> = function (props) {
		const store = React.useContext(StoreContext);
		assertProvider(store);
		const [state, setState] = React.useState(store.state);

		React.useEffect(() => {
			return store.subscribe((_, nextState) => {
				setState(nextState as ProviderState<T>);
			});
		});

		return props.children(state);
	};

	const useStore: UseStore<T> = function () {
		const store = React.useContext(StoreContext);
		assertProvider(store);

		return store;
	};

	const useSelector: UseSelector<T> = function useSelector(selector) {
		const store = React.useContext(StoreContext);
		assertProvider(store);

		const [state, setState] = React.useState(selector(store.state));

		React.useEffect(() => {
			return store.subscribe((_, nextState) => {
				const newState = selector(nextState);
				if (!shallowEqual(state, newState)) {
					setState(newState);
				}
			});
		});

		return state;
	};

	const useActions: UseActions<T> = function useActions() {
		const actions = (React.useContext(StoreContext) as unknown) as T["actions"];
		assertProvider(actions);

		return actions;
	};

	// TODO:
	const useDispatch = function () {
		const actions = useActions();
		return function (name, ...args: any[]) {
			return actions[name](...args);
		};
	};

	// connect(mapStateToProps, mapActionToProps)(Component)
	const connect = function (
		mapStateToProps?: (state: ProviderState<T>, props: any) => {},
		mapActionToProps?: (actions: T["actions"], props: any) => {}
	) {
		return function (Component: React.ElementType) {
			return function WrappedComponent(props: any) {
				const store = React.useContext(StoreContext);
				assertProvider(store);
				const actions = useActions();

				const stateToProps = useSelector(state => mapStateToProps?.(state, props));

				return (
					<>
						<Component {...props} {...stateToProps} {...mapActionToProps?.(actions, props)} />
					</>
				);
			};
		};
	};

	return {
		Context: StateContext,
		Provider,
		Consumer,
		useStore,
		useSelector,
		useActions,
		connect,
	};
}
