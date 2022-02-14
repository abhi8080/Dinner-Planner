import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import React from "react";
import {render} from "react-dom";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";


let SearchPresenter;
let SearchFormView;
let SearchResultsView;
const X = TEST_PREFIX;

try {
    SearchPresenter = require("../src/reactjs/" + X + "searchPresenter.js").default;
    SearchFormView = require("../src/views/" + X + "searchFormView.js").default;
    SearchResultsView = require("../src/views/" + X + "searchResultsView.js").default;
} catch (e) {console.log(e);}


function findFormEventNames(){
    const {customEventNames}= prepareViewWithCustomEvents(
        SearchFormView,
        {dishTypeOptions:['starter', 'main course', 'dessert']},
        function collectControls(rendering){
            const buttons=findTag("button", rendering).filter(function(button){ return button.children.flat()[0].toLowerCase().trim().startsWith("search"); });
            const selects=findTag("select", rendering);
            const inputs=findTag("input", rendering);
            expect(buttons.length, "SearchFormview expected to have one search button").to.equal(1);
            expect(inputs.length, "SearchFormView expected to have one  input box").to.equal(1);
            expect(selects.length, "SearchFormView expected to have one  select box").to.equal(1);
            return [...inputs, ...selects, ...buttons];
        });
    return customEventNames;
}

//var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
//nativeInputValueSetter.call(input, 'react 16 value');

function findResultsEventName(){
    const {customEventNames}= prepareViewWithCustomEvents(
        SearchResultsView,
        {searchResults},
        function findSpans(rendering){
            return findTag("span", rendering).filter(function(span){ return span.props.onClick; });
        });
    return customEventNames;
}


describe("TW3.2 React (stateful) Search presenter", function () {
    this.timeout(200000);

    const formProps=[];
    const resultsProps=[];
    function DummyForm(props){
        formProps.push(props);
        return <span>dummy form</span>;
    }
    function DummyResults(props){
        resultsProps.push(props);
        return <span>dummy results</span>;
    }
    const h = React.createElement;
    function replaceViews(tag, props, ...children){
        if(tag==SearchFormView)
            return h(DummyForm, props, ...children);
        if(tag==SearchResultsView)
            return h(DummyResults, props, ...children);
        return h(tag, props, ...children);
    };
    
    let currentDishId;

    async function doRender(){
        const div= document.createElement("div");
        window.React=React;
        React.createElement= replaceViews;
        formProps.length=0;
        resultsProps.length=0;
        
        await withMyFetch(
            mySearchFetch,
            function theRender(){
                render(<SearchPresenter model={{
                    setCurrentDish(id){
                        currentDishId=id;
                    }
                }}/>, div);
            },
            function makeResults(url){
                return {results:searchResults};
            }  
        );
        return div;
    }
    before(async function () {
        if (!SearchPresenter) this.skip();
    });
    after(function(){
        React.createElement=h;
    });
    it("Search presenter changes state when the form query and type change", async function(){
        const [setText, setType, doSearch]= findFormEventNames();
        await doRender();
        
        await new Promise(resolve => setTimeout(resolve)); // wait for eventual promise to resolve
        expect(formProps.slice(-1)[0][setType]).to.be.a("Function");
        expect(formProps.slice(-1)[0][setText]).to.be.a("Function");
 
        const len= formProps.length;
        let len1, len2;
        await withMyFetch(   // just in case we have "search as you type";
            mySearchFetch,
            async function interact(){
                formProps.slice(-1)[0][setText]("pizza");
                len1=formProps.length;
                formProps.slice(-1)[0][setType]("main course");
                len2=formProps.length;
            },
            function makeResults(url){
                return {results:[searchResults[1], searchResults[0]]};
            }            
        );
        
        expect(len1-len, "setting the search query should change state and re-render").to.equal(1);
        expect(len2-len1,  "setting the search type should change state and re-render").to.equal(1);
        await new Promise(resolve => setTimeout(resolve)); // wait for eventual promise to resolve
    });

    it("Search presenter initiates a search promise at first render and resolves the promise in component state", async function(){
        const [resultChosen]= findResultsEventName();
        const div= await doRender();
        expect(mySearchFetch.lastFetch, "presenter should launch a search at component creation").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", ""), "first search launched by presenter should be with empty params").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", ""), "first search launched by presenter should be with empty params").to.be.ok;
        
        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "an image expected to be rendered during promise resolve").to.equal("IMG");
        expect(resultsProps.length, "search results view should not be rendered during promise resolve").to.equal(0);

        await new Promise(resolve => setTimeout(resolve)); // wait for initial promise to resolve

        expect(resultsProps.length, "search results view should be rendered after promise resolve").to.equal(1);
        expect(resultsProps[0].searchResults, "search results view should be rendered after promise resolve").to.equal(searchResults);

        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "the search results view expected to be rendered after promise resolve").to.equal("SPAN");
        expect(div.firstElementChild.firstElementChild.nextSibling.textContent, "the search results view expected to be rendered after promise resolve").to.equal("dummy results");

        expect(resultsProps.slice(-1)[0][resultChosen]).to.be.a("Function");
        resultsProps.slice(-1)[0][resultChosen]({id:42});
        expect(currentDishId, "clicking on a search results should set the current dish in the model").to.equal(42);
    });
    
    it("Search presenter initiates a search promise after filling the form and button click", async function(){
        const [setText, setType, doSearch]= findFormEventNames();
        const [resultChosen]= findResultsEventName();

        const div= await doRender();
        await new Promise(resolve => setTimeout(resolve)); // wait for initial promise to resolve

        expect(formProps.slice(-1)[0][setType]).to.be.a("Function");
        expect(formProps.slice(-1)[0][setText]).to.be.a("Function");
        expect(formProps.slice(-1)[0][doSearch]).to.be.a("Function");
        
        mySearchFetch.lastFetch=undefined;
        resultsProps.length=0;
        const formLen= formProps.length;
        let formLen2;
        await withMyFetch(   // just in case we have "search as you type";
            mySearchFetch,
            async function interact(){
                formProps.slice(-1)[0][setType]("main course");
                formProps.slice(-1)[0][setText]("pizza");
                formProps.slice(-1)[0][doSearch]();
                formLen2= formProps.length;
            },
            function makeResults(url){
                return {results:[searchResults[1], searchResults[0]]};
            }            
        );
        expect(formLen2-formLen).to.equal(3);
        expect(formProps.length-formLen).to.equal(4);
        expect(mySearchFetch.lastFetch, "presenter should launch a search at button click").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", "main course"), "search should use type parameter from state").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", "pizza"), "search should use text parameter from state").to.be.ok;
        
        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "an image expected to be rendered during promise resolve").to.equal("IMG");
        expect(resultsProps.length, "search results view should not be rendered during promise resolve").to.equal(3);

        await new Promise(resolve => setTimeout(resolve));

        expect(resultsProps.length, "search results view should be rendered after promise resolve").to.equal(4);
        expect(JSON.stringify(resultsProps[3].searchResults), "search results view should be rendered after promise resolve").to.equal(JSON.stringify([searchResults[1], searchResults[0]]));
        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "the search results view expected to be rendered after promise resolve").to.equal("SPAN");
        expect(div.firstElementChild.firstElementChild.nextSibling.textContent, "the search results view expected to be rendered after promise resolve").to.equal("dummy results");

        resultsProps.slice(-1)[0][resultChosen]({id:43});
        expect(currentDishId, "clicking on a search results should set the current dish in the model").to.equal(43);

    });
    
    it("on successive searches, presenter only renders results of last search", async function(){
        const [setText, setType, doSearch]= findFormEventNames();
        
        const div= await doRender();
        await new Promise(resolve => setTimeout(resolve)); // wait for initial promise to resolve
        
        mySearchFetch.lastFetch=undefined;
        const formLen= formProps.length;
        let formLen2;
        await withMyFetch(
            mySearchFetch,
            async function interact(){
                formProps.slice(-1)[0][setType]("dessert");
                formProps.slice(-1)[0][doSearch]();
                formProps.slice(-1)[0][setType]("starter");
                formProps.slice(-1)[0][doSearch]();
            },
            function makeResults(url){
                if(url.indexOf("dessert")!=-1)
                    return {results:[searchResults[1], searchResults[0]], delay:3};
                else
                    return {results:[searchResults[1]]};
            }
        );

        expect(resultsProps.find(p=>p.searchResults.length==2)).to.not.be.ok;
        await new Promise(resolve => setTimeout(resolve, 5));  // wait so that the slowest promise resolves
        expect(resultsProps.find(p=>p.searchResults.length==2)).to.not.be.ok;
 });
});
