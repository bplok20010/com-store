import { createStore, Model } from "../src";

const data: {
	items: Array<{
		id: number;
		title: string;
		desc: string;
		seq: number;
	}>;
	[x: string]: any;
} = {
	a: 1,
	b: "2",
	items: [{ id: Date.now(), title: "item", desc: "test", seq: 1 }],
};

class TestModel extends Model<typeof data> {
	static getInitialState() {
		return data;
	}
	add(data: { id: number; title: string; desc: string; seq: number }) {
		const { state } = this;

		this.setState({
			ab: 1,
			items: [...state.items, { id: Date.now(), seq: 1, ...data }],
		});
	}
	remove(id: number) {
		const { state } = this;
		this.setState({
			items: state.items.filter(item => item.id !== id),
		});
	}
	update(id: number) {
		const { state } = this;
		this.setState({
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
	}
}

export default createStore(TestModel);
