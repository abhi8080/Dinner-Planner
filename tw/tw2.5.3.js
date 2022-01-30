import render from "./teacherRender.js";

const VueRoot=require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").default;

render(
        <VueRoot/>,
    document.getElementById('root')
);

window.myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;
