import React from "react";

import TodoStore from "./TodoStore";

const Item = React.memo(function ({ id }: { id: number }) {
	const store = TodoStore.useStore();
	const remove = store.remove.bind(store);
	const update = store.update.bind(store);
	const item = TodoStore.useSelector(state => state.items.find(item => item.id === id));

	if (!item) return null;

	return (
		<div className="item">
			<div className="title">
				{item.id}. {item.title}
			</div>
			<div className="desc">
				{item.desc} - [{item.seq} <button onClick={() => update(item.id)}>refresh</button>] --{" "}
				{Date.now()}
			</div>
			<div className="remove" onClick={() => remove(item.id)}>
				Remove
			</div>
		</div>
	);
});

function List() {
	const items = TodoStore.useSelector(state => state.items);

	return (
		<>
			<div>timestamp: {Date.now()}</div>
			{items.length ? null : <div className="item">no data.</div>}
			{items.map((item, i) => {
				return <Item key={item.id} id={item.id} />;
			})}
		</>
	);
}

function AddBtn() {
	const store = TodoStore.useStore();
	return (
		<>
			<button
				onClick={() =>
					store.add({
						title: "item",
						desc: "test",
					})
				}
			>
				Add
			</button>
		</>
	);
}

function Total() {
	const total = TodoStore.useSelector(state => state.items.length);

	return <div className="total">{total} total</div>;
}

function RenderCounter(props) {
	let [counter, update] = React.useState(0);

	React.useEffect(() => {
		update(counter + 1);
	}, [props]);

	return <>{counter}</>;
}

class TodoList extends React.Component {
	render() {
		return (
			<div className="todo-list">
				<TodoStore.Provider>
					<AddBtn></AddBtn>
					<button onClick={() => this.forceUpdate()}>Refresh</button> <RenderCounter />
					<Total />
					<List />
				</TodoStore.Provider>
			</div>
		);
	}
}
export default TodoList;
