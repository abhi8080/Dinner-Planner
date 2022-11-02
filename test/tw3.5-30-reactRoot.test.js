import React from "react";
const h= React.createElement;
import {render} from "react-dom";

import {checkImageAndProps, checkUpdateFromFirebase, checkFirebaseUpdate} from "./rootUtils.js";
import {dummyImgName} from "./searchUtils.js";

let ReactRoot;
const X = TEST_PREFIX;
try {
    ReactRoot = require("../src/reactjs/" + X + "ReactRoot.js").default;
} catch (e) {console.log(e);}

describe("TW3.5 ReactRoot", function tw3_5_30() {
    this.timeout(200000); // increase to allow debugging during the test run

    const propsHistory=[];
    function Dummy(props){
        const [, reRender]= React.useState();
        React.useEffect(function(){
            props.model.addObserver(function(){ reRender(new Object());});
        },[]);
        propsHistory.push(props);
        return <span>{props.model.numberOfGuests}{props.model.dishes.length}</span>;
    }
    function DummyImg(props){
        propsHistory.push(dummyImgName);
        return "dummyIMG";
    }
    
    function replaceViews(tag, props, ...children){
        if(tag== require("../src/views/" + X + "app.js").default)
            return h(Dummy, props, ...children);
        if(tag=="img") // FIXME this assumes that the presenter renders no other image than the spinner
            return h(DummyImg, props, ...children);
        return h(tag, props, ...children);
    };
    
    function doRender(){
        window.React=React;
        const div= document.createElement("div");
        React.createElement=replaceViews;
        propsHistory.length=0;

        render(<ReactRoot/>, div);
        return div;
    }
    
    before(function tw3_5_30_before() {
        if (!ReactRoot) this.skip();

    });
    after(function tw3_5_30_after(){
        React.createElement=h;
    });
    
    it("ReactRoot resolves the firebase promise and passes the result to App", async function tw_3_5_30_1(){
        await checkImageAndProps(doRender, propsHistory);
    });

    it("Model passed by ReactRoot is persisted to firebase", async function tw_3_5_30_2(){
        await checkFirebaseUpdate(propsHistory);
    });

    it("ReactRoot children updated when firebase notifies", async function tw_3_5_30_3(){
        await checkUpdateFromFirebase(propsHistory);
    });


});