import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import React from "react";
import {render} from "react-dom";
import {dishInformation} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";

let SidebarPresenter;
let SidebarView;
const X = TEST_PREFIX;

try {
    SidebarPresenter = require("../src/reactjs/" + X + "sidebarPresenter.js").default;
    SidebarView = require("../src/views/" + X + "sidebarView.js").default;
} catch (e) { }


function findSidebarEventNames(){
    const {customEventNames}= prepareViewWithCustomEvents(
        SidebarView,
        {
            number:5,
            dishes:[dishInformation]
        },
        function collectControls(rendering){
            const link=findTag("a", rendering)[0];
            const buttons=findTag("button", rendering);
            expect(buttons.length, "SearchFormview expected to have one search button").to.equal(3);
            expect(buttons[0].children[0]).to.equal("-");
            expect(buttons[1].children[0]).to.equal("+");
            expect(buttons[2].children[0].toLowerCase()).to.equal("x");
            return [link, buttons[0], buttons[2]];
        });
    return customEventNames;
}

describe("TW3.2 React Sidebar presenter (observer)", function tw_3_2_40() {
    this.timeout(200000);

    const propsHistory=[];
    function Dummy(props){
        propsHistory.push(props);
        return <span>dummy view</span>;
    }
    const h = React.createElement;
    function replaceViews(tag, props, ...children){
        if(tag== SidebarView)
            return h(Dummy, props, ...children);
        return h(tag, props, ...children);
    };
    let turnOff;
    function Guard(props){
        const [state, setState]= React.useState(true);
        React.useEffect(()=> turnOff=()=>setState(false), []);
        return state && props.children;
    }
    
    let currentDishId;
    let removedDish;
    let nrGuests;
    
    let observers=[];
    const model={
        dishes: [dishInformation],
        numberOfGuests: 7,
        addObserver(o){ observers.push(o);},
        removeObserver(o){ observers= observers.filter(obs=>obs!=o);},
        setCurrentDish(id){ currentDishId=id; },
        removeFromMenu(dish){ removedDish=dish; },
        setNumberOfGuests(x){nrGuests=x;},
    };    
    function doRender(){
        const div= document.createElement("div");
        window.React=React;
        React.createElement= replaceViews;
        propsHistory.length=0;
        
        render(<Guard><SidebarPresenter model={model}/></Guard>, div);
        return div;
    }
    before(async function tw_3_2_40_before() {
        if (!SidebarPresenter) this.skip();
    });
    after(function tw_3_2_40_after(){
        React.createElement=h;
    });
    function checkAgainstModel(){
        expect(propsHistory.slice(-1)[0].number, "passed people should be the number of guests").to.equal(model.numberOfGuests);
        expect(JSON.stringify(propsHistory.slice(-1)[0].dishes), "passed dishes should be the menu").to.equal(JSON.stringify(model.dishes));
    }
    it("Sidebar presenter renders view with correct props", async function tw_3_2_40_1(){
        const[setCurrent, setNumber, remove]=findSidebarEventNames();
        doRender();
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();
        expect(propsHistory.slice(-1)[0][setCurrent], "callback prop must be a function").to.be.a("Function");
        expect(propsHistory.slice(-1)[0][setNumber], "callback prop must be a function").to.be.a("Function");
        expect(propsHistory.slice(-1)[0][remove], "callback prop must be a function").to.be.a("Function");

        const dish={id:42};
        propsHistory.slice(-1)[0][setCurrent](dish);
        expect(currentDishId, "custom event handler should call the appropriate model method").to.equal(42);

        propsHistory.slice(-1)[0][remove](dish);
        expect(removedDish, "custom event handler should call the appropriate model method").to.equal(dish);

        propsHistory.slice(-1)[0][setNumber](17);
        expect(nrGuests, "custom event handler should call the appropriate model method").to.equal(17);
    });

    it("Sidebar presenter updates view with correct props",  async function tw_3_2_40_2(){
        model.numberOfGuests=3;
        model.dishes=[dishInformation, {... dishInformation, id:42}];
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();

        model.dishes=[dishInformation, {... dishInformation, id:42}, {... dishInformation, id:43}];
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();

        model.numberOfGuests=2;
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        checkAgainstModel();
    });

    it("Sidebar presenter removes observer subscriptions at teardown", async  function tw_3_2_40_3(){
        turnOff();
        await new Promise(resolve => setTimeout(resolve));  
        expect(observers.length, "observers should be unsubscribed at teardown").to.equal(0);
    });
});
