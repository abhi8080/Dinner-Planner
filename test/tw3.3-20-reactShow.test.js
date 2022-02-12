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
        let hiddenClass, shownClass;

        const subtreeMsg= "Show should render given children";
        function checkRenderTruthyTree(){
            expect(renderings[renderings.length-1].rendering.children.flat().length, "one child expected").to.equal(1);
            expect(renderings[renderings.length-1].rendering.children.flat()[0].tag, "one DIV child exected").to.equal("div");
            expect(renderings[renderings.length-1].rendering.children.flat()[0].children.length, subtreeMsg).to.equal(1);
            expect(renderings[renderings.length-1].rendering.children.flat()[0].children[0], subtreeMsg).to.equal("hello world!");
        }

        function getClass(){
            return renderings[renderings.length-1].rendering.props.class || renderings[renderings.length-1].rendering.props.className;
        }
        function divExpected(){
            expect(renderings[renderings.length-1].rendering.tag, "Show that uses hidden CSS is expected to render a DIV").to.equal("div");
        }

        if(!rendersFalsy){
            divExpected();
            hiddenClass=getClass();
            expect(hiddenClass, "if JSX is returned by Show hidden mode, it must have a hiding CSS class").to.be.ok;
            checkRenderTruthyTree();
        }

        window.location.hash="details";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire
        
        if(rendersFalsy){
            // since chilldren are expected to be rendered, this is going to be an array
            expect(renderings[renderings.length-1].rendering[0].tag, subtreeMsg).to.equal("div");
            expect(renderings[renderings.length-1].rendering[0].children.length, subtreeMsg).to.equal(1);
            expect(renderings[renderings.length-1].rendering[0].children[0], subtreeMsg).to.equal("hello world!");
        }else{
            // a root div is expected to be rendered
            divExpected();
            shownClass=getClass();
            expect(hiddenClass, "if JSX is returned by Show visible mode, it must have a showing CSS class, different from the hiding one").to.not.equal(shownClass);
            checkRenderTruthyTree();
        }
            

        window.location.hash="summary";
        await new Promise(resolve => setTimeout(resolve));  // letting the hashchange event to fire

        if(rendersFalsy)
            expect(renderings[renderings.length-1].rendering).to.not.be.ok;
        else{
            divExpected();
            expect(getClass(), "when hidden, class should always be the same").to.equal(hiddenClass);
            checkRenderTruthyTree();
        }

        renderings.cleanup();

        if(!rendersFalsy){
            const div= document.createElement("div");
            div.className=  hiddenClass;
            document.body.lastElementChild.append(div); 
            try{
                expect(window.getComputedStyle(div)["display"], "CSS class shown in hidden mode should not render anything visible").to.equal("none");
            }finally{
                document.body.lastElementChild.firstChild.remove();
            }
            
            div.className=  shownClass;
            document.body.lastElementChild.append(div); 
            try{
                expect(window.getComputedStyle(div)["display"],  "CSS class shown in visible mode should render visible").to.not.equal("none");
            }finally{
                document.body.lastElementChild.firstChild.remove();
            }
        }
    });
});

