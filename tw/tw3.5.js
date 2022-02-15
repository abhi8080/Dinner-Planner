import render from "./teacherRender.js";
import "./teacherFirebase.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+X+"DinnerModel.js").default;
const App=require("/src/views/"+X+"app.js").default;

let firebaseModel;

try{
    firebaseModel=require("/src/"+X+"firebaseModel.js");
    require("/src/views/"+X+"navigation.js");
}catch(e){
    render(<div>
             Please write /src/firebaseModel.js
           </div>,  document.getElementById('root'));
}
if(firebaseModel){
    const {updateFirebaseFromModel, updateModelFromFirebase}=firebaseModel;
    const VueRoot= {
        data(){ return {rootModel:new DinnerModel()};},
        render(){ return <App model={this.rootModel} />;},
        created(){
            updateFirebaseFromModel(this.rootModel);
            updateModelFromFirebase(this.rootModel);
            window.myModel=this.rootModel;
        }
    };
    render(
        <VueRoot/>
        , document.getElementById('root')
    );
}





