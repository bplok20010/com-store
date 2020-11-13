import Model from "./Model";

export type Subscriber<T = any> = (prevState: T, nextState: T) => void;
export type UseSelector<T extends Model> = <S extends (state: T["state"]) => any>(
	selector: S
) => ReturnType<S>;
export type UseStore<T extends Model> = () => T;
export type Consumer<T extends Model> = React.FC<ConsumerProps<T["state"]>>;
// export type Context<T extends StoreOptions> = React.Context<ProviderState<T>>;
// TODO:
export type Connect<T extends any, S extends (state: any, props: any) => any> = (
	mapStateToProps: S,
	mapActionToProps
) => (component: React.ElementType) => JSX.Element;

export interface ConsumerProps<T> {
	children: (state: T) => React.ReactElement | null;
}
