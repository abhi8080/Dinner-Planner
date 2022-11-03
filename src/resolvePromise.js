function resolvePromise(promise, promiseState){
    promiseState.promise = promise;
    promiseState.data = null;         
    promiseState.error = null;
    function saveDataACB(result){ 
        if(promiseState.promise !== promise) return;
        /* TODO save result in promiseState, as before */
        promiseState.data = result;
    } 
    function saveErrorACB(err)  { 
        /* TODO same check as above */
        if(promiseState.promise !== promise) return;
        promiseState.error = err;
        /* TODO save err in promiseState, as before */
    }
    if(promise == null) return;
    
    promise.then(saveDataACB).catch(saveErrorACB);
}
export default resolvePromise;
