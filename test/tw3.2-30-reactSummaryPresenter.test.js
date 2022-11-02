import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import React from "react";
import {render} from "react-dom";
import {dishInformation} from "./mockFetch.js";

let SummaryPresenter;
let SummaryView;
let utilities;
const X = TEST_PREFIX;

try {
    SummaryPresenter = require("../src/reactjs/" + X + "summaryPresenter.js").default;
    SummaryView = require("../src/views/" + X + "summaryView.js").default;
    utilities= require('../src/'+TEST_PREFIX+'utilities.js');
} catch (e) { }


describe("TW3.2 React Summary presenter (observer)", function tw3_2_30() {
    this.timeout(200000);

    const propsHistory=[];
    function Dummy(props){
        propsHistory.push(props);
        return <span>dummy view</span>;
    }
    const h = React.createElement;
    function replaceViews(tag, props, ...children){
        if(tag==SummaryView)
            return h(Dummy, props, ...children);
        return h(tag, props, ...children);
    };
    let turnOff;
    function Guard(props){
        const [state, setState]= React.useState(true);
        React.useEffect(()=> turnOff=()=>setState(false), []);
        return state && props.children;
    }
    
    let observers=[];
    const model={
        dishes: [dishInformation],
        numberOfGuests: 7,
        addObserver(o){ observers.push(o);},
        removeObserver(o){ observers= observers.filter(obs=>obs!=o);}
    };    
    function doRender(){
        const div= document.createElement("div");
        window.React=React;
        React.createElement= replaceViews;
        propsHistory.length=0;
        
        render(<Guard><SummaryPresenter model={model}/></Guard>, div);
        return div;
    }
    before(async function tw3_2_30_before () {
        if (!SummaryPresenter) this.skip();
    });
    after(function tw3_2_30_after(){
        React.createElement=h;
    });
    it("Summary presenter renders view with correct props", async function tw3_2_30_1(){
        const {shoppingList}= utilities;
        doRender();
        await new Promise(resolve => setTimeout(resolve));  
        expect(propsHistory.slice(-1)[0].people, "passed people should be the number of guests").to.equal(7);
        expect(JSON.stringify(propsHistory.slice(-1)[0].ingredients), "passed ingredients should be the shopping list").to.equal(JSON.stringify(shoppingList([dishInformation])));
    });

    it("Summary presenter updates view with correct props",  async function tw3_2_30_2(){
        const {shoppingList}= utilities;
        model.numberOfGuests=3;
        model.dishes=[dishInformation, {... dishInformation, id:42}];
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        expect(propsHistory.slice(-1)[0].people, "passed people should be the number of guests").to.equal(3);
        expect(JSON.stringify(propsHistory.slice(-1)[0].ingredients), "passed ingredients should be the shopping list").to.equal(JSON.stringify(shoppingList([dishInformation, dishInformation])));

        model.dishes=[dishInformation, {... dishInformation, id:42}, {... dishInformation, id:43}, {... dishInformation, id:44}];
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        expect(JSON.stringify(propsHistory.slice(-1)[0].ingredients), "passed ingredients should be the shopping list").to.equal(JSON.stringify(shoppingList([dishInformation, dishInformation, dishInformation, dishInformation])));

        model.numberOfGuests=2;
        observers.forEach(o=>o());
        await new Promise(resolve => setTimeout(resolve));  
        expect(propsHistory.slice(-1)[0].people, "passed people should be the number of guests").to.equal(2);
    });

    it("Summary presenter removes observer subscriptions at teardown", async  function tw3_2_30_3(){
        turnOff();
        await new Promise(resolve => setTimeout(resolve));  
        expect(observers.length, "observers should be unsubscribed at teardown").to.equal(0);
    });
});
