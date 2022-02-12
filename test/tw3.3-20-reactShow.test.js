import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {dishInformation} from "./mockFetch.js";
import {renderWithState} from "./mockReact.js";
import {findTag} from "./jsxUtilities.js";

let Show;

const X = TEST_PREFIX;
try {
    Show= require("../src/reactjs/" + X + "show.js").default;
} catch(e) {};

describe("TW3.3 React navigation Show", function() {
    this.timeout(200000);
    
    before(function(){
        if(!Show) this.skip();
    });
    
    it("React Show changes state if hash changes", async function(){
        window.location.hash="search";
        installOwnCreateElement();
        const renderings= renderWithState(Show,{
            hash:"#details",
            children: [React.createElement("div", {}, "hello world!")]
        });
        expect(renderings[renderings.length-1].state.length, "expected Show to have a single state value").to.equal(1);
        expect(renderings[renderings.length-1].state[0], "expected Show state to be false when the location hash is not props.hash").to.equal(false);
        
        window.location.hash="details";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire
        expect(renderings[renderings.length-1].state.length, "expected Show to have a single state value").to.equal(1);
        expect(renderings[renderings.length-1].state[0], "expected Show state to be true when the location hash is the same as props.hash").to.equal(true);
        
        window.location.hash="summary";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire
        expect(renderings[renderings.length-1].state.length, "expected Show to have a single state value").to.equal(1);
        expect(renderings[renderings.length-1].state[0], "expected Show state to be false when the location hash is not props.hash").to.equal(false);
        
        renderings.cleanup();
        const len= renderings.length;
        
        window.location.hash="details";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire
        expect(renderings.length, "Show should not change state on hashChange after teardown").to.equal(len);
        
        window.location.hash="";
    });
    
    it("React Show only renders children visible if the location hash is the same as props hash", async function(){
        window.location.hash="search";
        installOwnCreateElement();
        const renderings= renderWithState(Show,{
            hash:"#details",
            children: [React.createElement("div", {}, "hello world!")]
        });
        const rendersFalsy=!renderings[renderings.length-1].rendering;
        if(!rendersFalsy){
            expect(renderings[renderings.length-1].rendering.tag).to.equal("div");
        }

        window.location.hash="details";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire
        console.log(renderings);
        
        if(rendersFalsy){
            // since chilldren are expected to be rendered, this is going to be an array
            expect(renderings[renderings.length-1].rendering[0].tag).to.equal("div");
            expect(renderings[renderings.length-1].rendering[0].children[0]).to.equal("hello world!");
        }else{
            // a root div is expected to be rendered
            expect(renderings[renderings.length-1].rendering.tag).to.equal("div");
        }
            

        window.location.hash="summary";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire

        if(rendersFalsy)
            expect(renderings[renderings.length-1].rendering).to.not.be.ok;
        else{
            expect(renderings[renderings.length-1].rendering.tag).to.equal("div");
        }
    });
});

