function resolvePromise(promise, promiseState, notifyObservers){
    promiseState.promise = promise;
    promiseState.data = null;         
    promiseState.error = null;

    if(notifyObservers) notifyObservers();
    function saveDataACB(result){ 
        if(promiseState.promise !== promise) return;
        /* TODO save result in promiseState, as before */
        promiseState.data = result;
        notifyObservers();
    } 
    function saveErrorACB(err)  { 
        /* TODO same check as above */
        if(promiseState.promise !== promise) return;
        promiseState.error = err;
        notifyObservers();
        /* TODO save err in promiseState, as before */
    }
    if(promise == null) return;
    
    promise.then(saveDataACB).catch(saveErrorACB);
}
export default resolvePromise;
