import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {dishInformation, searchResults} from "./mockFetch.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";

const X = TEST_PREFIX;

function urlInResult(url){
    return {results:[url] };
}

describe("TW3.3 Navigation buttons in views", function tw_3_3_30() {
    this.timeout(200000);

    it("Views should be available",  function() {
        expect(require("../src/views/" + X + "searchFormView.js").default).to.be.ok;
        expect(require("../src/views/" + X + "searchResultsView.js").default).to.be.ok;
        expect(require("../src/views/" + X + "sidebarView.js").default).to.be.ok;
        expect(require("../src/views/" + X + "summaryView.js").default).to.be.ok;
        expect(require("../src/views/" + X + "detailsView.js").default).to.be.ok;
    });

     it("SummaryView should have a button leading to search",  async function  tw_3_3_30_1() {
         installOwnCreateElement();
         const rendering= require("../src/views/" + X + "summaryView.js").default({people:2, ingredients:[]});
         const buttons=findTag("button", rendering);
         expect(buttons.length).to.equal(1);
         
         window.location.hash="summary";
         buttons[0].props.onClick();
         await new Promise(resolve => setTimeout(resolve));
         expect(window.location.hash, "Summary button should navigate to search").to.equal("#search");
     });

    it("DetaillsView should have a button leading to search without adding the dish",  async function  tw_3_3_30_2() {
        installOwnCreateElement();
        const rendering= require("../src/views/" + X + "detailsView.js").default( {isDishInMenu:true, guests:2, dishData:dishInformation});
        
        const buttons=findTag("button", rendering).filter(function(button){ return !button.props.disabled; });
        expect(buttons.length, "DetailsView expected to have one single enabled (navigation) button if dish is in menu").to.equal(1);

        window.location.hash="details";
        buttons[0].props.onClick();
        await new Promise(resolve => setTimeout(resolve));
        expect(window.location.hash, "Details navigation button should navigate to search").to.equal("#search");
    });
    
    it("DetaillsView dish adding button should lead to search",  async function  tw_3_3_30_3() {
        const {clickables, rendering}= prepareViewWithCustomEvents(
            require("../src/views/" + X + "detailsView.js").default,
            {isDishInMenu:true, guests:2, dishData:dishInformation},
            function makeButtons(rendering){
                const buttons=findTag("button", rendering).filter(function(button){ return button.props.disabled; });
                expect(buttons.length, "DetailsView expected to have one single disabled (add to menu) button if dish is in menu").to.equal(1);
                return buttons;
            });

        window.location.hash="summary";
        clickables[0].props.onClick();
        await new Promise(resolve => setTimeout(resolve));
        expect(window.location.hash,  "Details add button should navigate to search").to.equal("#search");
    });

    it("SidebarView dish view links should open dish details",  async function  tw_3_3_30_4() {
        installOwnCreateElement();

        function findLinks(rendering){
            return findTag("a", rendering);
        }
        const rendering1= require("../src/views/" + X + "sidebarView.js").default( { number:2, dishes:[dishInformation]});

        const hrefs= findLinks(rendering1).filter(function(a){
            return a.props.href!="#details";
        });
        if(hrefs.length==0)
            // all links have the correct href
            return;
        
        const {clickables, rendering}= prepareViewWithCustomEvents(
            require("../src/views/" + X + "sidebarView.js").default,
            { number:2, dishes:[dishInformation]},
            findLinks);

        expect(clickables.length).to.equal(1);
        window.location.hash="summary";
        const event=new Event("change", {  bubbles: true,  cancelable: true  });
        clickables[0].props.onClick(event);
        await new Promise(resolve => setTimeout(resolve));
        expect(window.location.hash,  "SidebarView dish links should navigate to details").to.equal("#details");
        expect(event.defaultPrevented, "click on a sidebar link should prevent default behavior").to.equal(true);
    });

    it("SearchResultsView dish click should lead to details",  async function  tw_3_3_30_5() {
        const {clickables, rendering}= prepareViewWithCustomEvents(
            require("../src/views/" + X + "searchResultsView.js").default,
            {searchResults},
            function findSpans(rendering){
                return findTag("span", rendering).filter(function checkSpan(span){
                    return span.props && span.props.onClick;
                });
            });

        expect(clickables.length).to.equal(searchResults.length);
        await Promise.all(clickables.map(async function  tw_3_3_30_5_loop(clickable){
            window.location.hash="search";
            clickable.props.onClick();
            await new Promise(resolve => setTimeout(resolve));
            expect(window.location.hash, "SearchResultsView click on any result should navigate to details").to.equal("#details");
        }));
    });
});

