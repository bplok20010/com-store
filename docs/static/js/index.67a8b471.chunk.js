(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{112:function(e,t,n){},125:function(e,t,n){"use strict";n.r(t);var s=n(0),a=n.n(s),r=n(72),i=n.n(r),o=(n(112),n(67),n(17)),c=n.n(o),l=(n(119),n(18),n(38),n(69),n(120),n(121),n(123),n(73)),u=n.n(l),m=n(24),d=n.n(m),f=n(74),h=n.n(f),p=n(75);function E(e,t){return e===t?0!==e||0!==t||1/e===1/t:e!==e&&t!==t}n.n(p).a;const b="You may forget to use the <Store.Provider> package component";function v(e){e.__$isProvider||h()(!1)}function g(e){return"function"===typeof e.state?e.state():e.state}var S=function(e){const t=g(e),n=e.actions||{},s=a.a.createContext(Object.assign({},n,{__$isProvider:!1,state:t,setState(){throw b},subscribe(){throw b}})),r=a.a.createContext(t),i=class extends a.a.Component{componentDidMount(){this.props.setup&&this.props.setup.call(this.store,this.getState())}constructor(t){super(t),d()(this,"_listeners",[]),d()(this,"store",void 0),d()(this,"state",g(e));const s=this,a={get __$isProvider(){return!0},get state(){return s.state},get setState(){return s.setState.bind(s)},get subscribe(){return s.subscribe.bind(s)}};this.store=Object.assign({},function(e,t){const n={};return Object.keys(e).forEach(s=>{n[s]=e[s].bind(t)}),n}(n,a),a)}getState(){return this.state}setState(e,t){const n=this.getState();super.setState(e,()=>{this._listeners.forEach(e=>{e(n,this.getState())}),t&&t()})}subscribe(e){return this._listeners.push(e),()=>{const t=this._listeners.indexOf(e);t>-1&&this._listeners.splice(t,1)}}componentWillUnmount(){this._listeners.length=0}render(){return a.a.createElement(r.Provider,{value:this.state},a.a.createElement(s.Provider,{value:this.store},this.props.children))}},o=function(e){const t=a.a.useContext(s);v(t);const n=a.a.useState(e(t.state)),r=c()(n,2),i=r[0],o=r[1];return a.a.useEffect(()=>t.subscribe((t,n)=>{const s=e(n);(function(e,t){if(E(e,t))return!0;if("object"!==typeof e||null===e||"object"!==typeof t||null===t)return!1;const n=Object.keys(e),s=Object.keys(t);if(n.length!==s.length)return!1;for(let a=0;a<n.length;a++)if(!Object.prototype.hasOwnProperty.call(t,n[a])||!E(e[n[a]],t[n[a]]))return!1;return!0})(i,s)||o(s)})),i},l=function(){const e=a.a.useContext(s);return v(e),e};return{Context:r,Provider:i,Consumer:function(e){const t=a.a.useContext(s);v(t);const n=a.a.useState(t.state),r=c()(n,2),i=r[0],o=r[1];return a.a.useEffect(()=>t.subscribe((e,t)=>{o(t)})),e.children(i)},useStore:function(){const e=a.a.useContext(s);return v(e),e},useSelector:o,useActions:l,connect:function(e,t){return function(n){return function(r){v(a.a.useContext(s));const i=l(),c=o(t=>null===e||void 0===e?void 0:e(t,r));return a.a.createElement(a.a.Fragment,null,a.a.createElement(n,u()({},r,c,null===t||void 0===t?void 0:t(i,r))))}}}}}({state:{a:1,b:"2",items:[{id:Date.now(),title:"item",desc:"test",seq:1}]},actions:{add(e){const t=this.state;(0,this.setState)({ab:1,items:[...t.items,Object.assign({id:Date.now(),seq:1},e)]})},remove(e){const t=this.state;(0,this.setState)({items:t.items.filter(t=>t.id!==e)})},update(e){const t=this.state;(0,this.setState)({items:t.items.map(t=>t.id===e?Object.assign({},t,{seq:t.seq+1}):t)})}}});const C=a.a.memo((function({id:e}){const t=S.useActions(),n=t.remove,s=t.update,r=S.useSelector(t=>t.items.find(t=>t.id===e));return r?a.a.createElement("div",{className:"item"},a.a.createElement("div",{className:"title"},r.id,". ",r.title),a.a.createElement("div",{className:"desc"},r.desc," - [",r.seq," ",a.a.createElement("button",{onClick:()=>s(r.id)},"refresh"),"] --"," ",Date.now()),a.a.createElement("div",{className:"remove",onClick:()=>n(r.id)},"Remove")):null}));function w(){const e=S.useSelector(e=>e.items);return a.a.createElement(a.a.Fragment,null,a.a.createElement("div",null,"timestamp: ",Date.now()),e.length?null:a.a.createElement("div",{className:"item"},"no data."),e.map((e,t)=>a.a.createElement(C,{key:e.id,id:e.id})))}function x(){const e=S.useActions().add;return a.a.createElement(a.a.Fragment,null,a.a.createElement("button",{onClick:()=>e({title:"item",desc:"test"})},"Add"))}function _(){const e=S.useSelector(e=>e.items.length);return a.a.createElement("div",{className:"total"},e," total")}function k(e){let t=a.a.useState(0),n=c()(t,2),s=n[0],r=n[1];return a.a.useEffect(()=>{r(s+1)},[e]),a.a.createElement(a.a.Fragment,null,s)}class y extends a.a.Component{render(){return a.a.createElement("div",{className:"todo-list"},a.a.createElement(S.Provider,null,a.a.createElement(x,null),a.a.createElement("button",{onClick:()=>this.forceUpdate()},"Refresh")," ",a.a.createElement(k,null),a.a.createElement(_,null),a.a.createElement(w,null)))}}var j=y;function O(){return a.a.createElement("div",{className:"main"},a.a.createElement(j,null),a.a.createElement(j,null))}i.a.render(a.a.createElement(O,null),document.getElementById("root"))},76:function(e,t,n){n(77),e.exports=n(125)}},[[76,1,2]]]);