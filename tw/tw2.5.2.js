import render from "./teacherRender.js";


// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+X+"DinnerModel.js").default;

let Search;
try{
    Search=require("/src/vuejs/"+X+"searchPresenter.js").default;
}catch(e){
    render(<div>
             Please write /src/vuejs/searchPresenter.js
           </div>,  document.getElementById('root'));
}
if(Search){
    
    const VueRoot={
        data(){
        return {rootModel: new DinnerModel()} ;
        } ,
        render(){
            return <Search model={this.rootModel} />;
        },
        created(){
        window.myModel= this.rootModel;
        },
    };
    
    render(
        <VueRoot/>
        ,    document.getElementById('root')
    );
}
