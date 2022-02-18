import render from "./teacherRender.js";

const X = TEST_PREFIX;
const VueRoot=require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").default;
let navigation;
try{
    require("/src/views/"+X+"navigation.js").default;
    navigation=true;
}catch(e){
    render(<div>
             Please write /src/views/navigation.js
           </div>,  document.getElementById('root'));
}
if(navigation){
render(
        <VueRoot/>,
    document.getElementById('root')
);
}

window.myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;
