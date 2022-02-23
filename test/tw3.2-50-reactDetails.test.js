import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import React from "react";
import {render} from "react-dom";
import {dishInformation} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";
import {compressHistory} from "./historyUtils.js";

let DetailsPresenter;
const X = TEST_PREFIX;

try {
    DetailsPresenter = require("../src/reactjs/" + X + "detailsPresenter.js").default;
} catch (e) {console.log(e);}


function findDetailsEventName(){
    const {customEventNames}= prepareViewWithCustomEvents(
        require("../src/views/" + X + "detailsView.js").default,
        {dishData:dishInformation, isDishInMenu:true, guests:6},
        function findButton(rendering){
            return findTag("button", rendering).filter(function(button){ return button.props && button.props.disabled; });
        });
    return customEventNames;
}

describe("TW3.2 React Details  presenter (observer)", function tw_3_2_50() {
    this.timeout(200000);

    const propsHistory=[];
    function Dummy(props){
        propsHistory.push(props);
        return <span>dummy view</span>;
    }
    function DummyImg(props){
        propsHistory.push(1984);
        return "dummyIMG";
    }
    const h = React.createElement;
    function replaceViews(tag, props, ...children){
        if(tag==require("../src/views/" + X + "detailsView.js").default)
            return h(Dummy, props, ...children);
        if(tag=="img") // FIXME this assumes that the presenter renders no other image than the spinner
            return h(DummyImg, props, ...children);
        return h(tag, props, ...children);
    };
    let turnOff;
    function Guard(props){
        const [state, setState]= React.useState(true);
        React.useEffect(()=> turnOff=()=>setState(false), []);
        return state && props.children;
    }
    
    let addedDish;
    
    let observers=[];
    const model={
        dishes: [],
        numberOfGuests: 7,
        currentDishPromiseState:{ promise: "bla", data: dishInformation},
        addObserver(o){ observers.push(o);},
        removeObserver(o){ observers= observers.filter(obs=>obs!=o);},
        addToMenu(dish){ addedDish=dish; },
    };

    let renderDiv;
    function doRender(){
        const div= document.createElement("div");
        window.React=React;
        React.createElement= replaceViews;
        propsHistory.length=0;
        
        render(<Guard><DetailsPresenter model={model}/></Guard>, div);
        return div;
    }
    before(async function tw_3_2_50_before() {
        if (!DetailsPresenter) this.skip();
    });
    after(function tw_3_2_50_after(){
        React.createElement=h;
    });
    function checkAgainstModel(){
        expect(propsHistory.slice(-1)[0].guests, "passed people should be the number of guests").to.equal(model.numberOfGuests);
        expect(JSON.stringify(propsHistory.slice(-1)[0].dishData), "passed dish should be the data in the current dish promise state").to.equal(JSON.stringify(model.currentDishPromiseState.data));
    }
    it("Details presenter renders view with correct props", async function tw_3_2_50_1(){
        const[add2Menu]=findDetailsEventName();
        renderDiv= doRender();
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();
        expect(propsHistory.slice(-1)[0][add2Menu], "callback prop must be a function").to.be.a("Function");

        propsHistory.slice(-1)[0][add2Menu]();
        expect(addedDish, "custom event handler should call the appropriate model method").to.equal(dishInformation);
    });

    it("Details presenter updates view with correct props",  async function tw_3_2_50_2(){
        propsHistory.length=0;
        model.currentDishPromiseState.promise=null;
        model.currentDishPromiseState.data=null;
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        expect(renderDiv.firstElementChild.textContent.toLowerCase(), '"no data" should be rendered when there is no promise').to.equal("no data");
        expect(propsHistory.length, "view should not be rendered when there is no promise").to.equal(0);

        model.currentDishPromiseState.promise="blabla";
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));
        expect(compressHistory(propsHistory).length, "view should not be rendered when promise is not resolved").to.equal(1);
        expect(propsHistory.slice(-1)[0]).to.equal(1984);

        model.currentDishPromiseState.data= dishInformation;
        model.currentDish= dishInformation.id;
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));
        const compressed= compressHistory(propsHistory); 
        expect(compressed.length, "view should be rendered when promise is resolved").to.equal(2);
        expect(compressed[0]).to.equal(1984);
        checkAgainstModel();
        expect(propsHistory.slice(-1)[0].isDishInMenu).to.not.be.ok;

        model.numberOfGuests=3;
        model.dishes=[dishInformation, {... dishInformation, id:42}];
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();
        expect(propsHistory.slice(-1)[0].isDishInMenu).to.be.ok;
        

        model.numberOfGuests=2;
        model.dishes=[{... dishInformation, id:42}, {... dishInformation, id:43}];
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();
        expect(propsHistory.slice(-1)[0].isDishInMenu).to.not.be.ok;

        model.currentDishPromiseState.promise="blablabbla";
        propsHistory.length=0;
        model.currentDishPromiseState.data=null;
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));
        expect(compressHistory(propsHistory).length, "view should not be rendered when promise is not resolved").to.equal(1);
        expect(propsHistory.slice(-1)[0]).to.equal(1984);
    });

    it("Details presenter removes observer subscriptions at teardown", async  function tw_3_2_50_3(){
        turnOff();
        await new Promise(resolve => setTimeout(resolve));  
        expect(observers.length, "observers should be unsubscribed at teardown").to.equal(0);
        
    });
});
