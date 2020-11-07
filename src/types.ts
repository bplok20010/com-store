export interface ViewModelCore {
	state: Record<any, any> | (() => Record<any, any>);
	actions: Record<string, (this: Store<any>, ...args: any[]) => any>;
}

export interface ViewModelInner<T extends ViewModelCore> {
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

export type ProviderState<T extends IViewModel> = GetStateType<T["state"]> &
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

export type GetStateType<T> = T extends () => any ? ReturnType<T> : T;
