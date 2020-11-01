import { createStore } from "../src";

let idx = 1;

export default createStore(
	{
		items: [{ id: idx, title: "demo1", desc: "test" }],
	},
	{
		actions: {
			add(data: any, { state, setState }) {
				setState({
					items: [...state.items, { id: ++idx, ...data }],
				});
			},
			remove(id: any, { state, setState }) {
				setState({
					items: state.items.filter(item => item.id !== id),
				});
			},
		},
	}
);
