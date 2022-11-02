import render from "./teacherRender.js";


// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+X+"DinnerModel.js").default;

//const AA= 523145,   BB= 787321,   CC= 452179;
//const AA= 548321,   BB= 758118,   CC=    1152690;
const AA= 1445969,  BB=  1529625, CC=    32104;

let proxyModel;
const VueRoot={
    data(){
        return {rootModel: new DinnerModel()} ;
    } ,
    render(){
        return <div>
                 current dish promise state: {JSON.stringify(this.rootModel.currentDishPromiseState)}
               </div>;
    },
    created(){
        proxyModel=this.rootModel;
    },
};

render(
    <VueRoot/>
    ,    document.getElementById('root')
);

proxyModel.setCurrentDish(BB);

setTimeout(function laterACB(){proxyModel.setCurrentDish(AA);}, 10000);

