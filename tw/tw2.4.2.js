import render from "./teacherRender.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;

let promiseNoData;
try{
    promiseNoData=require("/src/views/"+X+"promiseNoData.js").default;
}catch(e){
    render(<div>
             Please write /src/views/promiseNoData.js
           </div>,  document.getElementById('root'));
}
if(promiseNoData){
    const VueRoot={
        data(){
            return { successPromiseStatus: {}, errorPromiseStatus:{}};
        } ,
        render(){
            return <div>{
                promiseNoData(this.successPromiseStatus)|| <div>Simmulated promise resolved successfully. Result: {this.successPromiseStatus.data}</div>
            }
                     <br/>
                     {
                         promiseNoData(this.errorPromiseStatus)|| <div>will never be seen</div>
            }</div>;
        },
        created(){
            const thisObj=this;
            setTimeout(function initializePromiseStatusACB(){
                thisObj.successPromiseStatus.promise="dummyPromise";
                thisObj.errorPromiseStatus.promise="dummyPromise";
            }, 1000);
            setTimeout(function setDataACB(){
                thisObj.successPromiseStatus.data="dummy promise result";
            }, 2000);
            setTimeout(function setErrorCB(){
                thisObj.errorPromiseStatus.error="dummy simualted error";
            }, 3000);
            
        }
    };
    
    render(
        <VueRoot/>
        ,    document.getElementById('root')
    );
}

