# com-store 待定

基于React Context API实现的状态管理库

## 安装

TODO:

## 使用

```tsx
import {createStore} from 'com-store';

const Store = createStore( {
  state: {
    text: 'hello'
  },
  actions: {
    setText(text){
      this.setState({
        text
      })
    }
  }
});

function App(){
    const text = Store.useSelector( state => state.text ); 
    const {setText} = Store.useActions();
   
    return <button onClick={() => setText(`timestamp: ${Date.now() / 1000}`)}>changed: {text}</button>
}

<Store.Provider>
    <App />
</Store.Provider>


```
---

## `createStore(vm: {
  state: {}
  actions: {}
}): Store;`

创建Store对象


## Store

### `Provider`

```jsx
<Store.Provider initialState={{name: 'com-store'}}>
    ...
</Store.Provider>

```

### Consumer

```jsx
<Store.Provider>
    ...
    <Store.Consumer>
        {state => {
            return <div>{state}</div>
        }}
    </Store.Consumer>
    ...
</Store.Provider>

```

### useSelector

订阅指定数据

```jsx

function Info(){
    const state = Store.useSelector(state => {
        return {
            username: state.username
        }
    });
    return <div>{state.username}</div>
}

```

### useStore


获取由Provider提供的store数据对象

```tsx
const store = Store.useStore();
store.getState();
// or
store.setState(...)
```

### useActions

TODO: 

### Context

可直接通过React.useContext获取数据

```tsx
const state = React.useContext(Store.Context);

```
