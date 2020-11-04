import { createStore } from "../src";

export default createStore(
	{
		items: [{ id: Date.now(), title: "item", desc: "test", seq: 1 }],
	},
	{
		actions: {
			add(data: any, { state, setState }) {
				setState({
					items: [...state.items, { id: Date.now(), seq: 1, ...data }],
				});
			},
			remove(id: number, { state, setState }) {
				setState({
					items: state.items.filter(item => item.id !== id),
				});
			},
			update(id: number, { state, setState }) {
				setState({
					items: state.items.map(item => {
						if (item.id === id) {
							return {
								...item,
								seq: item.seq + 1,
							};
						}
						return item;
					}),
				});
			},
		},
	}
);
