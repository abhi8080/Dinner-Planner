import dishesConst from "/test/dishesConst.js";
import render from "./teacherRender.js";
const VueRoot=require("./"+TEST_PREFIX+"VueRoot.js").default;

const X= TEST_PREFIX;
let getDishDetails;

try{
    getDishDetails= require("/src/"+X+"dishSource.js").getDishDetails;
    if(!getDishDetails) throw "no getDihDetails defined";
}catch(e){
    render(<div>Please write /src/dishSource.js and export getDishDetails</div>,  document.getElementById('root'));
}
if(getDishDetails){
    //const AA= 523145,   BB= 787321,   CC= 452179;
    //const AA= 548321,   BB= 758118,   CC=    1152690;
    const AA= 1445969,  BB=  1529625, CC=    32104;

    render(
        <div>Wait...</div>,
        document.getElementById('root')
    );
    Promise.all([getDishDetails(AA), getDishDetails(BB), getDishDetails(CC)]).then(
        function testACB(dishes){
            render(
                <VueRoot/>,
                document.getElementById('root')
            );
            window.myModel= require("./"+TEST_PREFIX+"VueRoot.js").proxyModel;
            
            dishes.forEach(function addDishCB(dish){window.myModel.addToMenu(dish);});
            window.myModel.setNumberOfGuests(5);
        })
        .catch(function errorACB(err){
            render(<div>{err}</div>,document.getElementById('root'));
        });
}
