import { Subscriber } from "./types";

export interface ModelConfig {
	// setState?: <K extends keyof S>(state: Pick<S, K> | S | null, cb?: (nextState: S) => void) => void;
	// reducer?: (prevState: S, action?: any) => S;
}

export class Model<S = any> {
	state = {};
	protected config: ModelConfig;
	protected _listeners: Subscriber[];
	constructor(config: ModelConfig = {}) {
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

	subscribe(subscriber: Subscriber): () => void {
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
