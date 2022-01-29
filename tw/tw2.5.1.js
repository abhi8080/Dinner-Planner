import render from "./teacherRender.js";


// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+X+"DinnerModel.js").default;

let Details;
try{
    Details=require("/src/vuejs/"+X+"detailsPresenter.js").default;
}catch(e){
    render(<div>
             Please write /src/vuejs/detailsPresenter.js
           </div>,  document.getElementById('root'));
}
if(Details){
    
    //const AA= 523145,   BB= 787321,   CC= 452179;
    //const AA= 548321,   BB= 758118,   CC=    1152690;
    const AA= 1445969,  BB=  1529625, CC=    32104;
    
    const VueRoot={
        data(){
        return {rootModel: new DinnerModel()} ;
        } ,
        render(){
            return <Details model={this.rootModel} />;
        },
        created(){
        window.myModel= this.rootModel;
        },
    };
    
    render(
        <VueRoot/>
        ,    document.getElementById('root')
    );
    
    setTimeout(function laterACB(){window.myModel.setCurrentDish(AA);}, 1000);
}
