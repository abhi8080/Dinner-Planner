import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {h, render} from "vue";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";

let SearchPresenter;
let SearchFormView;
let SearchResultsView;
const X = TEST_PREFIX;

let searchDishes;
try {
    SearchPresenter = require("../src/vuejs/" + X + "searchPresenter.js").default;
    SearchFormView = require("../src/views/" + X + "searchFormView.js").default;
    SearchResultsView = require("../src/views/" + X + "searchResultsView.js").default;
    searchDishes= require("../src/" + X + "dishSource.js").searchDishes;
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
            return findTag("span", rendering).filter(function checkSpanCB(span){ return span.props && span.props.onClick; });
        });
    return customEventNames;
}


describe("TW3.2 Vue stateful Search presenter", function () {
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
    const oldParams={};
    function makeModel(){
        return {
            setCurrentDish(id){
                currentDishId=id;
            },
            // temporary for the first test only!
            doSearch(params){
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
    async function doRender(){
        const div= document.createElement("div");
        window.React={createElement: replaceViews};
        formProps.length=0;
        resultsProps.length=0;
        
        await withMyFetch(
            mySearchFetch,
            function theRender(){
                render(<Root/>, div);
            },
            function makeResults(url){
                return {results:searchResults};
            }  
        );
        return div;
    }
    before(async function () {
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
    after(function(){
        React.createElement=h;
    });


    function checkResults(div, res){
        expect(JSON.stringify(resultsProps.slice(-1)[0].searchResults), "search results view should be rendered after promise resolve").to.equal(JSON.stringify(res));
        expect(resultsProps.slice(-2)[0], "an image should be rendered before promise resolve").to.equal(1984);
        
        // TODO: at this point, all values before 1984 (image), should be the previous results (which can be a parameter to checkResults)
        // then a number of 1984 are acceptable
        
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
        
        expect(resultsProps.find(p=>p!=1984 && p.searchResults.length==2), "the first, slower search should not save in promise state").to.not.be.ok;
 });
});
