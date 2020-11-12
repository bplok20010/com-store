import React from "react";
import invariant from "invariant";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";
import Model from "./Model";
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
	// invariant(provider.__$isProvider, errorMsg);
}

type InitModel = Model | typeof Model | Record<string, Model | typeof Model>; //| typeof Model | Record<string, Model | typeof Model>;

export { Model, createStore };

// function createStore<T extends Record<string, Model | typeof Model>>(model: T): any;
function createStore<T extends Model>(model: T): any;
function createStore<T extends typeof Model>(model: T): any {
	let defaultModel: T extends typeof Model ? InstanceType<T> : T;

	if (typeof model === "function") {
		defaultModel = new model() as InstanceType<T>;
	} else if (model instanceof Model) {
		defaultModel = model;
	}

	// const defaultModel = model instanceof Model ? Model : new model();

	const StoreContext = React.createContext(defaultModel);
	const StateContext = React.createContext(defaultModel.getState());

	const Provider = class extends React.Component<ProviderProps> {
		protected _listeners: any[];

		protected store: InstanceType<T>;

		constructor(props: any) {
			super(props);

			this._listeners = [];

			const store = new model();

			store.subscribe((prevState, nextState) => {
				// TODO: check isInit
				this.forceUpdate(() => {
					this.notifyAll(prevState, nextState);
				});
			});

			this.store = store as InstanceType<T>;
		}

		componentDidMount() {
			if (this.props.setup) {
				this.props.setup.call(this.store, this.getState());
			}
		}

		getState() {
			return this.store.getState();
		}

		notifyAll(prevState, nextState) {
			this._listeners.forEach(listener => {
				listener(prevState, nextState);
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
				<StateContext.Provider value={this.getState()}>
					<StoreContext.Provider value={this.store}>{this.props.children}</StoreContext.Provider>
				</StateContext.Provider>
			);
		}
	};

	const Consumer: Consumer<T> = function (props) {
		// const store = React.useContext(StoreContext);
		// assertProvider(store);
		// const [state, setState] = React.useState(store.state);

		// React.useEffect(() => {
		// 	return store.subscribe((_, nextState) => {
		// 		setState(nextState as ProviderState<T>);
		// 	});
		// });

		return props.children(React.useContext(StateContext));
	};

	const useStore: UseStore<T> = function () {
		const store = React.useContext(StoreContext);
		assertProvider(store);

		return store;
	};

	const useSelector: UseSelector<T> = function useSelector(selector) {
		const store = React.useContext(StoreContext);
		assertProvider(store);

		const [state, setState] = React.useState(selector(store.getState()));

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
		const store = useStore();

		return store;
	};

	// TODO:
	const useDispatch = function () {
		const actions = useActions();
		return function (name, ...args: any[]) {
			return actions[name](...args);
		};
	};

	// TODO:
	const useState = function () {
		const store = React.useContext(StoreContext);
		const state = React.useState(StateContext);
		return [state, (newState: ProviderState<T>) => store.setState(newState)];
	};

	// connect(mapStateToProps, mapActionToProps)(Component)
	const connect = function (
		mapStateToProps?: (state: ProviderState<T>, props: any) => {},
		mapActionToProps?: (actions: any, props: any) => {}
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
		useDispatch,
		useState,
		connect,
	};
}
