import {h, render} from "vue";
import {checkImageAndProps, checkUpdateFromFirebase, checkFirebaseUpdate} from "./rootUtils.js";
import {dummyImgName} from "./searchUtils.js";

let VueRoot;
const X = TEST_PREFIX;
try {
    VueRoot = require("../src/vuejs/" + X + "VueRoot.js").default;
} catch (e) {console.log(e);}

describe("TW3.5 VueRoot", function tw3_5_20() {
    this.timeout(200000); // increase to allow debugging during the test run

    const propsHistory=[];
    function Dummy(props){
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
        const div= document.createElement("div");
        window.React={createElement:replaceViews};
        propsHistory.length=0;

        render(<VueRoot/>, div);
        return div;
    }
    
    before(function tw3_5_20_before() {
        if (!VueRoot) this.skip();
    });
    after(function tw3_5_20_after(){
        React.createElement=h;
    });

    it("VuetRoot resolves the firebase promise and passes the result to App", async function tw_3_5_20_1(){
        await checkImageAndProps(doRender, propsHistory);
    });

    it("Model passed by VueRoot is persisted to firebase", async function tw_3_5_20_2(){
        await checkFirebaseUpdate(propsHistory);
    });
    
    it("VueRoot children updated when firebase notifies", async function tw_3_5_20_3(){
        await checkUpdateFromFirebase(propsHistory);
    });


});