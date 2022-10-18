import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {h, render} from "vue";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";
import {findFormEventNames, findResultsEventName, makeRender, dummyImgName} from "./searchUtils.js";

let SearchPresenter;

const X = TEST_PREFIX;

try {
    SearchPresenter = require("../src/vuejs/" + X + "searchPresenter.js").default;
} catch (e) { }


describe("TW3.2 Vue stateful Search presenter", function tw3_2_20() {
    this.timeout(200000);

    const formProps=[];
    const resultsProps=[];

    let currentDishId;
    const oldParams={};
    function makeModel(){
        return {
            setCurrentDish(id){
                currentDishId=id;
            },
            // temporary for the first test only!
            doSearch(params){
                const searchDishes=require("../src/" + X + "dishSource.js").searchDishes;
                this.searchResultsPromiseState.promise=searchDishes(params).then(results=>this.searchResultsPromiseState.data=results);
                this.searchResultsPromiseState.data=null;
            },
            // temporary for first test only!
            searchResultsPromiseState:{},
            // temporary
            setSearchQuery(query){ this.searchParams.query=query; },
            setSearchType(type){ this.searchParams.type=type; },
            // temporary
            searchParams:{},
        };
    };

    let vueModel;
    const Root={
        data(){ return {rootModel:makeModel()};},
        render(){
            return <SearchPresenter model={this.rootModel}/>;
        },
        created(){
            vueModel= this.rootModel;
        }
    };
    const doRender= makeRender(formProps, resultsProps, h, render, {}, function makeSearchRoot(){return <Root/>;});
    before(async function tw3_2_20_before() {
        if (!SearchPresenter || typeof SearchPresenter == "function"){
            let reactPresenter;
            try{
                reactPresenter= require("../src/reactjs/" + X + "searchPresenter.js");
            }catch(e){}
            if(!reactPresenter)
                expect.fail("Either a React presenter or a Vue object presenter should be defined");
            this.skip();
        }
    });
    after(function tw3_2_20_after(){
        React.createElement=h;
    });


    function checkResults(div, res){
        expect(JSON.stringify(resultsProps.slice(-1)[0].searchResults), "search results view should be rendered after promise resolve").to.equal(JSON.stringify(res));
        expect(resultsProps.slice(-2)[0], "an image should be rendered before promise resolve").to.equal(dummyImgName);
        
        // TODO: at this point, all values before dummyImgName (image), should be the previous results (which can be a parameter to checkResults)
        // then a number of dummyImgName are acceptable
        
        expect(div.firstElementChild.firstElementChild.nextSibling.tagName, "the search results view expected to be rendered after promise resolve").to.equal("SPAN");
        expect(div.firstElementChild.firstElementChild.nextSibling.textContent, "the search results view expected to be rendered after promise resolve").to.equal("dummy results");
    }

    it("Search presenter initial test, should also pass with TW2 functional code", async function tw3_2_20_1(){
        const [setText, setType, doSearch]= findFormEventNames();
        const div= await doRender();

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        expect(formProps.slice(-1)[0][setType]).to.be.a("Function");
        expect(formProps.slice(-1)[0][setText]).to.be.a("Function");
        expect(formProps.slice(-1)[0][doSearch]).to.be.a("Function");

        checkResults(div, searchResults);

        mySearchFetch.lastFetch=undefined;
        resultsProps.length=0;
        await withMyFetch(  
            mySearchFetch,
            async function interact(){
                formProps.slice(-1)[0][setType]("main course");
                formProps.slice(-1)[0][setText]("calzone");
                formProps.slice(-1)[0][doSearch]();
            },
            function makeResults(url){
                return {results:[searchResults[1], searchResults[0]]};
            }            
        );

        expect(mySearchFetch.lastFetch, "presenter should initiate a search at button click").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", "main course"), "search should use type parameter from state").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", "calzone"), "search should use text parameter from state").to.be.ok;

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        checkResults(div, [searchResults[1], searchResults[0]]);
    });


    it("Search presenter object component test, convert your functional component to an object!", async function tw3_2_20_2(){
        expect(SearchPresenter, "presenter must now be an object so we can add state").to.be.a("Object");
        const [setText, setType, doSearch]= findFormEventNames();
        const div= await doRender();

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        expect(formProps.slice(-1)[0][setType]).to.be.a("Function");
        expect(formProps.slice(-1)[0][setText]).to.be.a("Function");
        expect(formProps.slice(-1)[0][doSearch]).to.be.a("Function");

        mySearchFetch.lastFetch=undefined;
        resultsProps.length=0;
        await withMyFetch(  
            mySearchFetch,
            async function interact(){
                formProps.slice(-1)[0][setType]("main course");
                formProps.slice(-1)[0][setText]("calzone");
                formProps.slice(-1)[0][doSearch]();
            },
            function makeResults(url){
                return {results:[searchResults[1], searchResults[0]]};
            }            
        );

        expect(mySearchFetch.lastFetch, "presenter should initiate a search at button click").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", "main course"), "search should use type parameter from state").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", "calzone"), "search should use text parameter from state").to.be.ok;

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update
        
        checkResults(div, [searchResults[1], searchResults[0]]);
        
    });

    it("Search presenter object component stores search parameters in component state", async function tw3_2_20_3(){
        expect(SearchPresenter, "presenter must now be an object so we can add state").to.be.a("Object");
        const [setText, setType, doSearch]= findFormEventNames();

        const div= await doRender();

        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        expect(formProps.slice(-1)[0][setType]).to.be.a("Function");
        expect(formProps.slice(-1)[0][setText]).to.be.a("Function");
        expect(formProps.slice(-1)[0][doSearch]).to.be.a("Function");
        
        mySearchFetch.lastFetch=undefined;
        resultsProps.length=0;
        
        formProps.slice(-1)[0][setType]("main course");
        formProps.slice(-1)[0][setText]("calzone");

        expect(vueModel.searchParams, "You should not store search params in application state (model) any longer").to.be.empty;
        const {searchResultsPromiseState, searchParams, ...rest}= vueModel;
        expect(JSON.stringify(rest),  "You should not modify application state (model) to store search parameters").to.equal("{}");
        expect(SearchPresenter.created, "use created() to initiate the first search promise").to.be.a("Function");
    });

    it("Search presenter resolves the promise in component state after filling the form and button click", async function tw3_2_20_4(){
        const [setText, setType, doSearch]= findFormEventNames();
        const [resultChosen]= findResultsEventName();

        const div= await doRender();
        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve)); // wait for eventual promise to resolve

        expect(formProps.slice(-1)[0][setType]).to.be.a("Function");
        expect(formProps.slice(-1)[0][setText]).to.be.a("Function");
        expect(formProps.slice(-1)[0][doSearch]).to.be.a("Function");
        
        mySearchFetch.lastFetch=undefined;
        resultsProps.length=0;
        await withMyFetch(   
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
        expect(vueModel.searchParams, "You should not store search params in application state any longer").to.be.empty;
        expect(vueModel.searchResultsPromiseState, "You should not resolve the promise in application state any longer").to.be.empty;
        const {searchResultsPromiseState, searchParams, ...rest}= vueModel;
        expect(JSON.stringify(rest),  "You should not modify application state (model) from Search presenter for search purposes").to.equal("{}");

        
        expect(mySearchFetch.lastFetch, "presenter should launch a search at button click").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", "main course"), "search should use type parameter from state").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", "pizza"), "search should use text parameter from state").to.be.ok;
        
        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve));  // UI update

        checkResults(div, [searchResults[1], searchResults[0]]);
        
        resultsProps.slice(-1)[0][resultChosen]({id:43});
        expect(currentDishId, "clicking on a search results should set the current dish in the model").to.equal(43);

        expect(SearchPresenter.created, "use created() to initiate the first search promise").to.be.a("Function");
    });

    it("Search presenter initiates a search promise at first render and resolves the promise in component state", async function tw3_2_20_5(){
        const [resultChosen]= findResultsEventName();
        expect(SearchPresenter.created, "use created() to initiate the first search promise").to.be.a("Function");
        mySearchFetch.lastFetch=undefined;
        resultsProps.length=0;

        const div= await doRender();

        expect(JSON.stringify(formProps.slice(-1)[0]["dishTypeOptions"]), "the options passed are not correct").to.equal(
            JSON.stringify(["starter", "main course", "dessert"])
        );

        expect(vueModel.searchParams, "You should not store search params in application state any longer").to.be.empty;
        expect(vueModel.searchResultsPromiseState, "You should not resolve the promise in application state any longer").to.be.empty;
        const {searchResultsPromiseState, searchParams, ...rest}= vueModel;
        expect(JSON.stringify(rest),  "You should not modify application state (model) from Search presenter for search purposes").to.equal("{}");

        
        expect(mySearchFetch.lastFetch, "presenter should initiate a search at component creation").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "type", ""), "first search launched by presenter should be with empty params").to.be.ok;
        expect(findCGIParam(mySearchFetch.lastFetch, "query", ""), "first search launched by presenter should be with empty params").to.be.ok;
        
        await mySearchFetch.lastPromise;
        await new Promise(resolve => setTimeout(resolve)); // wait for eventual promise to resolve
      
        checkResults(div, searchResults);
        
        expect(resultsProps.slice(-1)[0][resultChosen]).to.be.a("Function");
        resultsProps.slice(-1)[0][resultChosen]({id:42});
        expect(currentDishId, "clicking on a search results should set the current dish in the model").to.equal(42);
    });
    
    
    it("on successive searches, presenter only renders results of last search", async function tw3_2_20_6(){
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

        await new Promise(resolve => setTimeout(resolve, 5));  // UI update
        
        checkResults(div, [searchResults[1]]);
        
        expect(resultsProps.find(p=>p!=dummyImgName && p.searchResults.length==2), "the first, slower search should not save in promise state").to.not.be.ok;
 });
});
