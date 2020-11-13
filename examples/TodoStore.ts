import { createStore, Model } from "../src";

type Data = {
	items: Array<{
		id: number;
		title: string;
		desc: string;
		seq: number;
	}>;
};

const data = {
	a: 1,
	b: "2",
	items: [{ id: Date.now(), title: "item", desc: "test", seq: 1 }],
};

class TestModel extends Model<Data> {
	state = data;
	add(data: { id: number; title: string; desc: string; seq: number }) {
		const { state } = this;

		this.setState({
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
