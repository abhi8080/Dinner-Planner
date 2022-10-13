import { assert, expect } from "chai";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";

const X = TEST_PREFIX;

function findFormEventNames(){
    const {customEventNames}= prepareViewWithCustomEvents(
        require("../src/views/" + X + "searchFormView.js").default,
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
        require("../src/views/" + X + "searchResultsView.js").default,
        {searchResults},
        function findSpans(rendering){
            return findTag("span", rendering).filter(function checkSpanCB(span){ return span.props && span.props.onClick; });
        });
    return customEventNames;
}


const dummyImgName = "promise loading image GIF";

function makeRender(formProps, resultsProps, h, render, theReact, makeRoot){
    function DummyForm(props){
        formProps.push(props);
        return <span>dummy form</span>;
    }
    function DummyResults(props){
        resultsProps.push(props);
        return <span>dummy results</span>;
    }

    function DummyImg(props){
        resultsProps.push(dummyImgName);
        return "dummyIMG";
    }    
    function replaceViews(tag, props, ...children){
        if(tag==require("../src/views/" + X + "searchFormView.js").default)
            return h(DummyForm, props, ...children);
        if(tag==require("../src/views/" + X + "searchResultsView.js").default)
            return h(DummyResults, props, ...children);
        if(tag=="img") // FIXME this assumes that the presenter renders no other image than the spinner
            return h(DummyImg, props, ...children);
        return h(tag, props, ...children);
    };
    return async function doRender(){
        const div= document.createElement("div");
        window.React= theReact;
        window.React.createElement= replaceViews;
        formProps.length=0;
        resultsProps.length=0;
        
        await withMyFetch(
            mySearchFetch,
            function theRender(){
                render(makeRoot(), div);
            },
            function makeResults(url){
                return {results:searchResults};
            }  
        );
        return div;
    };
}

export {findResultsEventName, findFormEventNames, makeRender, dummyImgName};
