// this is a stub for TW3.5 bootstraping. It helps with a few lab specifics
import {render, h} from "vue";

// needed for View JSX. In a Vue project you can use import {h} from "vue"
window.React= {createElement:h};

import firebase from "firebase/app";
import "firebase/database";

// needed for plugging in a "mock" firebase for testing. In the project simply import firebase where needed, as above
window.firebase=firebase;

// uncomment when you implemented firebaseModel in TW3.5. require() is needed, to use window.firebase above
//const {firebaseModelPromise, updateFirebaseFromModel, updateModelFromFirebase}=require("/src/firebaseModel.js");

// require() because the lab App loads React/Vue presenters
const App=require("/src/views/app.js").default;

// import DinnerModel, navigation,

// import promiseNoData, you will need it during resolve of firebaseModelPromise
// resolvePromise may be useful as well!

// render a VueRoot that resolves firebaseModelPromise, then displays the App (see tw/tw3.5.js)
