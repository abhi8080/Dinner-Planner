// Add relevant imports here
import {
  firebaseModelPromise,
  updateFirebaseFromModel,
  updateModelFromFirebase,
} from "../firebaseModel.js";
import resolvePromise from "../resolvePromise.js";
import promiseNoData from "../views/promiseNoData.js";
import App from "../views/app.js";
// Define the ReactRoot component
function ReactRoot() {
  const [promiseState] = React.useState({});
  const [, setError] = React.useState({});
  const [, setData] = React.useState({});
  function wasCreatedACB() {
    resolve(firebaseModelPromise());
  }
  function resolve(thePromise) {
    function promiseStateChangedACB() {
      setError(promiseState["error"]);
      setData(promiseState["data"]);
      if (promiseState.data) {
        updateFirebaseFromModel(promiseState.data);
        updateModelFromFirebase(promiseState.data);
      }
    }
    resolvePromise(thePromise, promiseState, promiseStateChangedACB);
  }
  React.useEffect(wasCreatedACB, []);
  return promiseNoData(promiseState) || <App model={promiseState.data} />;
}

export default ReactRoot;
