import Model from "./Model";

type GetStateType<T> = T extends () => any ? ReturnType<T> : T;

export interface StoreOptionsBase {
	state: Record<any, any> | (() => Record<any, any>);
	actions: {
		[k: string]: (this: ThisType<Store<any>>) => any;
	};
}

export interface StoreOptions<T extends StoreOptionsBase = StoreOptionsBase> {
	state: T["state"] extends () => any ? ReturnType<T["state"]> : T["state"];
	actions: Record<any, (...args: any[]) => any>;
}

export type Subscriber<T> = (prevState: T, nextState: T) => void;
export type UseSelector<T extends StoreOptions> = <
	S extends (state: GetStateType<T["state"]>) => any
>(
	selector: S
) => ReturnType<S>;
export type UseStore<T extends StoreOptions> = () => Store<T>;
export type Consumer<T extends StoreOptions> = React.FC<ConsumerProps<T>>;
export type Context<T extends StoreOptions> = React.Context<ProviderState<T>>;
export type UseActions<T extends StoreOptions> = () => T["actions"];
// TODO:
export type Connect<
	T extends StoreOptions,
	S extends (state: ProviderState<T>, props: any) => any
> = (mapStateToProps: S, mapActionToProps) => (component: React.ElementType) => JSX.Element;

export interface ConsumerProps<T extends StoreOptions> {
	children: (state: T) => React.ReactElement | null;
}

export interface ProviderProps {
	setup?: (this: Model) => void;
}

export type ProviderState<T extends StoreOptions> = GetStateType<T["state"]>;

export type BaseStore<T extends StoreOptions> = {
	__$isProvider: boolean;
	state: ProviderState<T>;
	setState<K extends keyof ProviderState<T>>(
		state: Pick<ProviderState<T>, K> | ProviderState<T> | null,
		cb?: () => void
	): void;
	subscribe(subscriber: Subscriber<T>): () => void;
};

export type Store<T extends StoreOptions> = BaseStore<T> &
	{
		[K in Exclude<keyof T["actions"], keyof BaseStore<T>>]: T["actions"][K];
	};

export interface StoreContext<T extends StoreOptions> {
	Context: Context<T>;
	Provider: React.ElementType<ProviderProps<T>>;
	Consumer: Consumer<T>;
	useStore: UseStore<T>;
	useSelector: UseSelector<T>;
	useActions: UseActions<T>;
	useDispatch: any;
	useState: any;
	connect: any;
}
