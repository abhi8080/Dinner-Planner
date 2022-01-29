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
    render(<div>Please define /src/resolvePromise.js</div>, document.getElementById('root'));
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
            // this. is not accessible to callbacks, so we provide what the callbacks need into a const
            const promiseState= this.promiseState;

            // function that returns a callack!
            function makeCallback(ms){
                function returnDataACB(){
                    return "resolved after "+ms;
                }
                function laterACB(){
                    const promise= sleep(2000).then(returnDataACB);
                    promise.name="promiseToResolveAfter_"+ms;
                    resolvePromise(promise, promiseState);
                }
                return laterACB;
            }
            
            sleep(1000).then(makeCallback(2000));
            sleep(5000).then(makeCallback(1000));
            sleep(8000).then(makeCallback(3000));
            sleep(10000).then(makeCallback(500));
        },
    };
    
    render(
        <VueRoot/>
        ,    document.getElementById('root')
    );
}



