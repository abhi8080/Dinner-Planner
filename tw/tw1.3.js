import render from "./teacherRender.js";
import dishesConst from "/test/dishesConst.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;
let SidebarView;

try{
    SidebarView=require("/src/views/"+X+"sidebarView.js").default;
}catch(e){
    render(<div>Please define /src/views/sidebarView.js</div>,  document.getElementById('root'));
}
if(SidebarView){
    function numberChangeACB(nr){ console.log("user wants to change the number to ", nr);}
    render(
            <div>
            <SidebarView number={5} dishes={[]}  onNumberChange={numberChangeACB} />
            </div>,
        document.getElementById('root')
    );
}

    
