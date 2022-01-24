import dishesConst from "/test/dishesConst.js";
import render from "./teacherRender.js";
const VueRoot=require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").default;

const X= TEST_PREFIX;
let searchDishes;

try{
   searchDishes= require("/src/"+X+"dishSource.js").searchDishes;
}catch(e){
    render(<div>Please write /src/dishSource.js and export searchDishes</div>,  document.getElementById('root'));
}
if(searchDishes){
    
    searchDishes({query:"pizza", type:"main course"}).then(
        function testACB(results){
            render(
                <ol>{
                    results.map(function eachResultCB(dishResult){
                        return <li>{JSON.stringify(dishResult)}</li>;
                    })
                }</ol>,
                document.getElementById('root')
            );
        });
}
