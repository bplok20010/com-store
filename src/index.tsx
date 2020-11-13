import React from "react";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";
import Model from "./Model";
import { Subscriber, Consumer, UseStore, UseSelector } from "./types";

export const version = "%VERSION%";

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

export { Model, createStore };

function createStore<T extends typeof Model>(model: T): any {
	let defaultModel = new model();

	const StoreContext = React.createContext(defaultModel as InstanceType<T>);
	const StateContext = React.createContext<InstanceType<T>["state"]>(defaultModel.getState());

	const Provider = class extends React.Component {
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

	const Consumer: Consumer<InstanceType<T>> = function (props) {
		return props.children(React.useContext(StateContext));
	};

	const useStore: UseStore<InstanceType<T>> = function () {
		return React.useContext(StoreContext);
	};

	const useSelector: UseSelector<InstanceType<T>> = function useSelector(selector) {
		const store = React.useContext(StoreContext);
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

	// TODO:
	const useDispatch = function () {
		const actions = useStore();
		return function (name, ...args: any[]) {
			return actions[name](...args);
		};
	};

	// TODO:
	const useState = function () {
		const store = React.useContext(StoreContext);
		const state = React.useState(StateContext);
		return [state, (newState: InstanceType<T>["state"]) => store.setState(newState)];
	};

	// connect(mapStateToProps, mapActionToProps)(Component)
	const connect = function (
		mapStateToProps?: (state: InstanceType<T>["state"], props: any) => {},
		mapActionToProps?: (actions: any, props: any) => {}
	) {
		return function (Component: React.ElementType) {
			return function WrappedComponent(props: any) {
				const store = React.useContext(StoreContext);

				const stateToProps = useSelector(state => mapStateToProps?.(state, props));

				return (
					<>
						<Component {...props} {...stateToProps} {...mapActionToProps?.(store, props)} />
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
		useDispatch,
		useState,
		connect,
	};
}
