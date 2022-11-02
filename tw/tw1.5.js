import render from "./teacherRender.js";
import dishesConst from "/test/dishesConst.js";

// make webpack load the file only if it exists
const SummaryView=require("/src/views/"+TEST_PREFIX+"summaryView.js").default;
const {shoppingList}=require("/src/"+TEST_PREFIX+"utilities.js");

function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}

render(
        <SummaryView people={3} ingredients={shoppingList([getDishDetails(2), getDishDetails(100), getDishDetails(200)])}/>,
    document.getElementById('root')
);
