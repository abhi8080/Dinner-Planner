import render from "./teacherRender.js";
import dishesConst from "/test/dishesConst.js";

let SidebarView;
const X= TEST_PREFIX;
try{
    SidebarView=require("/src/views/"+X+"sidebarView.js").default;
}catch(e){
    render(<div>Please define /src/views/sidebarView.js</div>,  document.getElementById('root'));
}
if(SidebarView) {   

    function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}
    
    render(
            <SidebarView number={3} dishes={[getDishDetails(200), getDishDetails(2), getDishDetails(100), getDishDetails(1)]}
                         onNumberChange={function(){console.log("UI is not interactive, we only test the View here");}}/>,
        document.getElementById('root')
    );
}    
