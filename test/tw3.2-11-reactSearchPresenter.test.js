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

function compressHistory(arr){
    return arr.reduce(function(acc, elem, index){
        if(index==0)
            return [elem];
        if(elem==acc.slice(-1)[0]  || JSON.stringify(elem)==JSON.stringify(acc.slice(-1)[0]))
            return acc;
        return [...acc, elem];
    }, []);
}

function findResultsEventName(){
    const {customEventNames}= prepareViewWithCustomEvents(
        SearchResultsView,
        {searchResults},
        function findSpans(rendering){
            return findTag("span", rendering).filter(function checkSpanCB(span){ return span.props && span.props.onClick; });
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
    function DummyImg(props){
        resultsProps.push(1984);
        return "dummyIMG";
    }
    const h = React.createElement;
    function replaceViews(tag, props, ...children){
        if(tag==SearchFormView)
            return h(DummyForm, props, ...children);
        if(tag==SearchResultsView)
            return h(DummyResults, props, ...children);
        if(tag=="img") // FIXME this assumes that the presenter renders no other image than the spinner
            return h(DummyImg, props, ...children);
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
            async function theRender(){
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
        expect(formProps.slice(-1)[0][setType], "expected the SearchFormView "+setType+" custom event handler prop to be set. Are you setting correct props?").to.be.a("Function");
        expect(formProps.slice(-1)[0][setText],  "expected the SearchFormView "+setType+" custom event handler prop to be set. Are you setting correct props?").to.be.a("Function");
 
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
    });

    function checkResults(div, res){
        expect(JSON.stringify(compressHistory(resultsProps).slice(-1)[0].searchResults), "search results view should be rendered after promise resolve").to.equal(JSON.stringify(res));
        expect(compressHistory(resultsProps).slice(-2)[0], "an image should be rendered before promise resolve").to.equal(1984);

        // TODO: at this point, all values before 1984 (image), should be the previous results (which can be a parameter to checkResults)
        // then a number of 1984 are acceptable

        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "the search results view expected to be rendered after promise resolve").to.equal("SPAN");
        expect(div.firstElementChild.firstElementChild.nextSibling.textContent, "the search results view expected to be rendered after promise resolve").to.equal("dummy results");
    }

    it("Search presenter initiates a search promise at first render and resolves the promise in component state", async function(){
        resultsProps.length=0;
        formProps.length=0;
        const [resultChosen]= findResultsEventName();
        const div= await doRender();

        expect(mySearchFetch.lastFetch, "presenter should launch a search at component creation").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", ""), "first search launched by presenter should be with empty params").to.be.ok;

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        checkResults(div, searchResults);
        expect(compressHistory(resultsProps).length, "initially search presenter displays an image, then the promise results").to.equal(2);
        expect(compressHistory(formProps).length, "initially search presenter displays an image, then the promise results").to.equal(1);
        
        expect(resultsProps.slice(-1)[0][resultChosen],  "expected the SearchResultsView "+resultChosen+" custom event handler prop to be set. Are you setting correct props?").to.be.a("Function");
        resultsProps.slice(-1)[0][resultChosen]({id:42});
        expect(currentDishId, "clicking on a search results should set the current dish in the model").to.equal(42);
    });
    
    it("Search presenter initiates a search promise after filling the form and button click", async function(){
        const [setText, setType, doSearch]= findFormEventNames();
        const [resultChosen]= findResultsEventName();

        const div= await doRender();
        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        expect(formProps.slice(-1)[0][setType],  "expected the SearchFormView "+setType+" custom event handler prop to be set. Are you setting correct props?").to.be.a("Function");
        expect(formProps.slice(-1)[0][setText],  "expected the SearchFormView "+setText+" custom event handler prop to be set. Are you setting correct props?").to.be.a("Function");
        expect(formProps.slice(-1)[0][doSearch],  "expected the SearchFormView "+doSearch+" custom event handler prop to be set. Are you setting correct props?").to.be.a("Function");
        
        resultsProps.length=0;

        mySearchFetch.lastFetch=undefined;
        await withMyFetch(   // just in case we have "search as you type";
            mySearchFetch,
            async function interact(){
                formProps.slice(-1)[0][setType]("main course");
                formProps.slice(-1)[0][setText]("pizza");
                formProps.slice(-1)[0][doSearch]();
            },
            function makeResults(url){
                return {results:[searchResults[1], searchResults[0]]};
            }            
        );

        expect(mySearchFetch.lastFetch, "presenter should launch a search at button click").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", "main course"), "search should use type parameter from state").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", "pizza"), "search should use text parameter from state").to.be.ok;

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        checkResults(div, [searchResults[1], searchResults[0]]);

        const compressed=compressHistory(resultsProps);
        expect(compressed[0].searchResults.length, "rendering should be done with the previous results while the form is fillled").to.equal(3);
        expect(compressed.length, "rendering should be done with the previous results first, then spinner image, then new results").to.equal(3);

        resultsProps.slice(-1)[0][resultChosen]({id:43});
        expect(currentDishId, "clicking on a search results should set the current dish in the model").to.equal(43);

    });
    
    it("on successive searches, presenter only renders results of last search", async function(){
        const [setText, setType, doSearch]= findFormEventNames();
        
        const div= await doRender();
        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update
        
        mySearchFetch.lastFetch=undefined;

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

        await new Promise(resolve => setTimeout(resolve, 5));  // UI update

        checkResults(div, [searchResults[1]]);
        
        expect(resultsProps.find(p=>p!=1984 && p.searchResults.length==2), "the first, slower search should not save in promise state").to.not.be.ok;
 });
});
