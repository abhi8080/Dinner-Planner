import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import React from "react";
import {render} from "react-dom";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";
import {findFormEventNames, findResultsEventName, makeRender, dummyImgName} from "./searchUtils.js";
import {compressHistory} from "./historyUtils.js";


let SearchPresenter;

const X = TEST_PREFIX;

try {
    SearchPresenter = require("../src/reactjs/" + X + "searchPresenter.js").default;
} catch (e) { }


describe("TW3.2 React (stateful) Search presenter", function tw3_2_11() {
    this.timeout(200000);
    
    const formProps=[];
    const resultsProps=[];
    const h= React.createElement;
        
    let currentDishId;
    const doRender= makeRender(formProps, resultsProps, h, render, React,
                               function makeSearchRoot(){
                                   return  (
                                       <SearchPresenter
                                         model={{
                                             setCurrentDish(id){
                                                 currentDishId=id;
                                             }
                                             
                                         }
                                               }/>
                                   );});
    
    before(async function tw3_2_11_before() {
        if (!SearchPresenter) this.skip();
    });
    after(function tw3_2_11_after(){
        React.createElement=h;
    });
    it("Search presenter changes state when the form query and type change", async function tw3_2_11_1(){
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
        expect(compressHistory(resultsProps).slice(-2)[0], "an image should be rendered before promise resolve").to.equal(dummyImgName);

        // TODO: at this point, all values before dummyImgName (image), should be the previous results (which can be a parameter to checkResults)
        // then a number of dummyImgName are acceptable

        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "the search results view expected to be rendered after promise resolve").to.equal("SPAN");
        expect(div.firstElementChild.firstElementChild.nextSibling.textContent, "the search results view expected to be rendered after promise resolve").to.equal("dummy results");
    }

    it("Search presenter initiates a search promise at first render and resolves the promise in component state", async function tw3_2_11_2(){
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
    
    it("Search presenter initiates a search promise after filling the form and button click", async function tw3_2_11_3(){
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
    
    it("on successive searches, presenter only renders results of last search", async function tw3_2_11_4(){
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
        
        expect(resultsProps.find(function tw3_2_11_4_checkPropsCB(p){
            return p!=dummyImgName && p.searchResults.length==2;
        }), "the first, slower search should not save in promise state").to.not.be.ok;
 });
});
