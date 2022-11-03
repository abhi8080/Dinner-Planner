function promiseNoData(promise) {

    if (!promise.promise) {
        return  (<div>No data</div>)
    } if (!promise.data && !promise.error) {
        return (<img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?20151024034921" />)
    } if (!promise.data && promise.error) {
        return (<div>{promise.error.toString()}</div>)
    }
    if(!promise.error) {
        return false;
    }
}
export default promiseNoData;