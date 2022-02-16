import render from "./teacherRender.js";
import "./teacherFirebase.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;

let firebaseModel;

try{
    firebaseModel=require("/src/"+X+"firebaseModel.js");
    if(!firebaseModel.firebaseModelPromise)
        throw "not found";
}catch(e){
    render(<div>
             Please write /src/firebaseModel.js and firebaseModelPromise
           </div>,  document.getElementById('root'));
}
if(firebaseModel && firebaseModel.firebaseModelPromise){
    const {firebaseModelPromise}=firebaseModel;

    firebaseModelPromise().then(function gotModelACB(model){
        render(
            <div>{JSON.stringify(model)}</div>
            , document.getElementById('root')
        );
    });
}
