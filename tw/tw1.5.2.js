import dishesConst from "/test/dishesConst.js";
import render from "./teacherRender.js";

const VueRoot=require("./"+TEST_PREFIX+"VueRoot.js").default;

render(
        <VueRoot/>,
    document.getElementById('root')
);

window.myModel= require("./"+TEST_PREFIX+"VueRoot.js").proxyModel;
function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}


window.myModel.addToMenu(getDishDetails(200));
window.myModel.addToMenu(getDishDetails(2));
window.myModel.addToMenu(getDishDetails(100));
window.myModel.addToMenu(getDishDetails(1));
window.myModel.setNumberOfGuests(5);
