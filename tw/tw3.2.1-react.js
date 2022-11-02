import render from "./teacherRender.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+TEST_PREFIX+"DinnerModel.js").default;

let Search;
try{
    Search=require("/src/reactjs/"+X+"searchPresenter.js").default;
}catch(e){
    render(<div>
             Please write /src/reactjs/searchPresenter.js
           </div>,  document.getElementById('root'));
}
if(Search){
    const model= new DinnerModel();

    function myObserverACB(){
        console.log(model);
    }
    model.addObserver(myObserverACB);
    
    window.myModel=model;
    render(
        <Search model={model}/>,
        document.getElementById('root')
    );       
}
