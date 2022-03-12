import render from "./teacherRender.js";

const VueRoot=require("./"+TEST_PREFIX+"VueRoot.js").default;

render(
        <VueRoot/>,
    document.getElementById('root')
);

window.myModel= require("./"+TEST_PREFIX+"VueRoot.js").proxyModel;
