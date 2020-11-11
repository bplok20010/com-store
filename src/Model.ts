import { Subscriber } from "./types";

type State = Record<any, any>;

export interface ModelConfig<S extends State> {
	// setState?: <K extends keyof S>(state: Pick<S, K> | S | null, cb?: (nextState: S) => void) => void;
	// reducer?: (prevState: S, action?: any) => S;
}

export class Model<S extends State = {}> {
	static getInitialState() {
		return {};
	}

	state: S;
	protected config: ModelConfig<S>;
	protected _listeners: Subscriber<S>[];
	constructor(config: ModelConfig<S> = {}) {
		this.state = {} as S;
		this.config = config || {};
		this._listeners = [];
	}

	getState() {
		return this.state;
	}

	setState<K extends keyof S>(state: Pick<S, K> | S | null) {
		if (!state) return;
		const prevState = this.state;

		this.state = {
			...prevState,
			...state,
		};

		this._listeners.forEach(listener => {
			listener(prevState, this.state);
		});
	}

	subscribe(subscriber: Subscriber<S>): () => void {
		this._listeners.push(subscriber);
		return () => {
			const idx = this._listeners.indexOf(subscriber);
			if (idx > -1) {
				this._listeners.splice(idx, 1);
			}
		};
	}

	cleanUp() {
		this._listeners = [];
	}

	dispatch() {}
}

export default Model;
