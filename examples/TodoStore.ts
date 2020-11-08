import { createStore } from "../src";

export default createStore({
	state: {
		a: 1,
		b: "2",
		items: [{ id: Date.now(), title: "item", desc: "test", seq: 1 }],
	},
	actions: {
		add(data: {}) {
			const { state, setState } = this;

			setState({
				ab: 1,
				items: [...state.items, { id: Date.now(), seq: 1, ...data }],
			});
		},
		remove(id: number) {
			const { state, setState } = this;
			setState({
				items: state.items.filter(item => item.id !== id),
			});
		},
		update(id: number) {
			const { state, setState } = this;
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
});
