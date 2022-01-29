import render from "./teacherRender.js";


// make webpack load the file only if it exists
const X= TEST_PREFIX;

let resolvePromise;
try{
    resolvePromise=require("/src/"+X+"resolvePromise.js").default;    
}catch(e){} 

// promissify setTimeout
function sleep(ms){ return new Promise(function(resolve, reject){ setTimeout(resolve, ms); });}
if(!resolvePromise){
    render("Please define /src/resolvePromise.js", document.getElementById('root'));
}else{
    const VueRoot={
        data(){
            return {promiseState:{}};
        } ,
        render(){
            return <div>
                     current promise state : {JSON.stringify(this.promiseState)}
                   </div>;
        },
        created(){
            const component=this;
            function returnDataACB(){
                return "dummy promise result";
            }
            function laterACB(){
                resolvePromise(sleep(2000).then(returnDataACB), component.promiseState);
            }
            
            sleep(1000).then(laterACB);
        },
    };
    
    render(
        <VueRoot/>
        ,    document.getElementById('root')
    );
}



