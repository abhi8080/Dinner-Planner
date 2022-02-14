import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {renderWithState} from "./mockReact.js";
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
} catch (e) {}

function urlInResult(url){
    return {results:[url] };
}

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



describe("TW3.2 React SearchPresenter", function () {
    this.timeout(200000);

    before(function () {
        if (!SearchPresenter || !SearchFormView || !SearchResultsView) this.skip();
    });

    async function basicRender(){
        let renderings;
        
        await withMyFetch(
            mySearchFetch,
            function initialRender(){
                renderings = renderWithState(SearchPresenter, {model: {},});
            },
            urlInResult
        );
        await new Promise(resolve => setTimeout(resolve));
        
        expect(renderings[0].rendering.children[0].tag).to.equal(SearchFormView, "expected first child to be SearchFormView");
        
        expect(renderings[0].state.reduce((acc,x)=>acc= acc+(x===""), 0), "expecing two state members initialized to empty string").to.equal(2);
        
        // was: test that event handlers are not prematurely called
        renderings[renderings.length-1].state.forEach(function(x){
            if(x&& x.constructor.name=="String")
                expect(x, "expected strings in React state to be initially empty").to.equal("");
        });
        // TODO we could also test that each React state member has changed exactly once. That probably means that the event handlers were not prematurely called.
        
        let searchFormViewProps = renderings[0].rendering.children[0].props;
        expect(searchFormViewProps, "The SearchFormView should have props").to.be.ok;
        expect(searchFormViewProps,"SearchFormView is missing prop dishTypeOptions").to.have.property("dishTypeOptions");
        expect(JSON.stringify(searchFormViewProps["dishTypeOptions"]), "the options passed are not correct").to.equal(
            JSON.stringify(["starter", "main course", "dessert"])
        );
        
        return renderings;
    }

    it("React SearchPresenter renders SearchFormView with correct props and custom event handlers for text and type", async function() {
        const [setText, setType, doSearch]= findFormEventNames();
        const  renderings= await basicRender();
        let searchFormViewProps = renderings[0].rendering.children[0].props;
        let len= renderings.length;
        searchFormViewProps[setText]("calzone");
        expect(renderings.length-len, "text custom event handler should change exactly one React state property").to.equal(1);
        expect(renderings[renderings.length-1].change[0].newValue, "text custom event handler should change a React state property to that value").to.equal("calzone");
        const whichState=renderings[renderings.length-1].change[0].index;
        
        len= renderings.length;
        searchFormViewProps[setType]("dessert");
        expect(renderings.length-len, "type custom event handler should change exactly one React state property").to.equal(1);
        expect(renderings[renderings.length-1].change[0].newValue, "type custom event handler should change a React state property to that value").to.equal("dessert");
        
        expect(whichState, "text and type custom event handlers should change different React state properties").to.not.equal(renderings[renderings.length-1].change[0].index);
        renderings.cleanup();
    });

    function checkFetchAndState(renderings, text, type){
        const resultChange= renderings[renderings.length-1].change[0];
        expect(resultChange.oldValue, "the last state change should be the promise resolve").to.not.be.ok;
        expect(resultChange.newValue.constructor.name, "promise should resolve to an array").to.equal("Array");

        expect(findCGIParam(resultChange.newValue[0], "type", type), "search form presenter expected to search for type \""+type+"\"").to.equal(true);
        expect(findCGIParam(resultChange.newValue[0], "query", text), "search form presenter should search for text \""+text+"\"").to.equal(true);


        expect(renderings[renderings.length-2].rendering.children[1].tag, "an image should be rendered during promise resolve").to.equal("img");
        renderings.cleanup();
    }

    
    it("React SearchPresenter resolves promise in React state", async function() {
        const [setText, setType, doSearch]= findFormEventNames();
        let  renderings= await basicRender();
        checkFetchAndState(renderings, "", "");

        function latestProps(){
            return renderings[renderings.length-1].rendering.children[0].props;
        };
        let searchFormViewProps;    
        await withMyFetch(
            mySearchFetch,
            function callSearchHandler(){
                searchFormViewProps = latestProps();
                searchFormViewProps[doSearch]();
            },
            urlInResult
        );
        await new Promise(resolve => setTimeout(resolve));
        checkFetchAndState(renderings, "", "");

        await withMyFetch(
            mySearchFetch,
            function fillInFormAndSearch(){
                searchFormViewProps = latestProps();
                searchFormViewProps[setText]("calzone");
                searchFormViewProps = latestProps();
                searchFormViewProps[setType]("dessert");
                searchFormViewProps = latestProps();
                searchFormViewProps[doSearch]();
            },
            urlInResult
        );
        await new Promise(resolve => setTimeout(resolve));
        checkFetchAndState(renderings, "calzone", "dessert");
        renderings.cleanup();

        // searches in rapid succession, check that stale resutls are never saved in state
        await withMyFetch(
            mySearchFetch,
            function callSearchHandlerRepeatedly(){
                // render
                renderings = renderWithState(SearchPresenter, {model: {},});

                // search with default params
                searchFormViewProps = latestProps();
                searchFormViewProps[doSearch]();

                // search calzone
                searchFormViewProps = latestProps();
                searchFormViewProps[setText]("calzone");
                searchFormViewProps = latestProps();
                searchFormViewProps[doSearch]();
                                
                // search pasticio
                searchFormViewProps[setText]("pasticio");
                searchFormViewProps = latestProps();
                searchFormViewProps[doSearch]();
            },
            urlInResult
        );
        await new Promise(resolve => setTimeout(resolve));
        
        checkFetchAndState(renderings, "pasticio", "");
        renderings.filter(function checkForArrays(rendering){
            return rendering.change && rendering.change[0].newValue && rendering.change[0].newValue.constructor.name=="Array";
        }).forEach(function checkForbiddenValues(rendering){
            const url= rendering.change[0].newValue[0];
            expect(findCGIParam(url, "type", ""), "search form presenter expected to search for type \"\"").to.equal(true);
            
            const immediateSearchMsg= "search form presenter should not save in state result for old text if another search is performed immediately after";
            expect(findCGIParam(url, "query", ""), immediateSearchMsg).to.equal(false);
            expect(findCGIParam(url, "query", "calzone"), immediateSearchMsg).to.equal(false);
        });
        renderings.cleanup();
    });

    it("React SearchPresenter passes correct props and custom events to SearchResultsView", async function () {
        let renderings;
        let dishId;
        await withMyFetch(
            mySearchFetch,
            function renderSomeResults(){
                renderings = renderWithState(SearchPresenter,      {
                    model: {
                        setCurrentDish: (id) => (dishId = id),
                    }});
            },
            function returnsSomeDishes(url){
                return {results: searchResults};
            }
        );
        await new Promise(resolve => setTimeout(resolve));
        
        expect(renderings[renderings.length-1].rendering.children[1].tag, "SearchResultsView should be rendered when promise is resolved").to.equal(SearchResultsView);
        
        let searchResultsViewProps = renderings[renderings.length-1].rendering.children[1].props;
        expect(searchResultsViewProps).to.be.ok;
        expect(searchResultsViewProps, "SearchResultsView is missing a prop").to.have.property("searchResults");
        expect(searchResultsViewProps["searchResults"]).to.equal(renderings[renderings.length-1].change[0].newValue);

        
        // test that event handlers are not prematurely called
        expect(dishId, "did not expect model method to be called").to.equal(undefined);

        const oneHandler = Object.keys(searchResultsViewProps).filter(function(prop){
            return !["searchResults"].includes(prop);
        });
        
        expect(oneHandler.length).to.equal(1, "expected 2 props in total");
        
        expect(typeof searchResultsViewProps[oneHandler[0]], "expected prop to be a function").to.equal("function");
        
        dishId = undefined;
        searchResultsViewProps[oneHandler[0]]({ id: 1 });
        expect(dishId, "Search presenter custom event handler calls the suitable model method").to.equal(1);

        let dish;
        installOwnCreateElement();
        const resultRendering=SearchResultsView({
            searchResults: renderings[renderings.length-1].change[0].newValue,
            [oneHandler[0]]: (d) => (dish = d),
        });

        const clickableSpan=findTag("span", resultRendering)[0];
        
        expect(clickableSpan, "span for search result not found").to.be.ok;
        clickableSpan.props.onClick();
        expect( dish, `expected dish parameter passed to ${oneHandler[0]} to have property id`).to.have.property("id");
        expect(dish.id, "SearchResultsView fires its custom event correctly").to.equal(587203);

        renderings.cleanup();
    });
});
