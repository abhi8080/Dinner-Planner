import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {findTag} from "./jsxUtilities.js";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";
import {h, render} from "vue";

let Show;
const X = TEST_PREFIX;

try {
  Show = require("../src/vuejs/" + X + "show.js").default;
} catch (e) { } 

describe("TW3.3 Vue navigation Show", function tw3_3_10() {
    this.timeout(200000);

    const div= document.createElement("div");
    let turnOff;
    const Guard={
        data(){ return {state:true};},
        render(){
            return this.state && this.$slots.default();
        },
        created(){
            turnOff= ()=> this.state=false;
        }
    };
    
    before(function  tw3_3_10_before() {
        if (!Show) this.skip();
        window.React= {createElement:h};
        render(<Guard><Show hash="#details"><span>Hello World!</span></Show></Guard>, div);
    });

    function expectHidden(rendersNothing){
        if(rendersNothing==undefined)
            rendersNothing= ! div.firstElementChild;
        if(!rendersNothing){
            expect(div.firstElementChild.firstElementChild, "show exepected to either render nothing, or render a DIV/SPAN").to.be.ok;
            expect(div.firstElementChild.firstElementChild.innerText, "show exepected to either render nothing, or render a DIV/SPAN with the children inside").to.equal("Hello World!");
            expect(div.firstElementChild.className, "show exepected to either render nothing, or render a DIV/SPAN with a class").to.be.ok;
            const div1= document.createElement("div");
            div1.className=  div.firstElementChild.className;
            document.body.lastElementChild.append(div1); 
            try{
                expect(window.getComputedStyle(div1)["display"], "CSS class shown in hidden mode should not render anything visible").to.equal("none");
            }finally{
                document.body.lastElementChild.firstChild.remove();
            }
        }
        return rendersNothing;
    }
    function expectShown(rendersNothing){
        if(rendersNothing)
            expect(div.innerText).to.equal("Hello World!");
        else{
            expect(div.firstElementChild.firstElementChild, "show exepected to either render nothing, or render a DIV/SPAN").to.be.ok;
            expect(div.firstElementChild.firstElementChild.innerText, "show exepected to either render nothing, or render a DIV/SPAN with the children inside").to.equal("Hello World!");

            const div1= document.createElement("div");
            if(div.firstElementChild.className)
                div1.className=  div.firstElementChild.className;
            document.body.lastElementChild.append(div1); 
            try{
                expect(window.getComputedStyle(div1)["display"], "CSS class shown in hidden mode should not render anything visible").to.not.equal("none");
            }finally{
                document.body.lastElementChild.firstChild.remove();
            }
        }
    }
    
    it("Show does not render (or hides) children if location hash is different from hash prop", async function  tw3_3_10_2(){
        window.location.hash="search";
        await new Promise(resolve => setTimeout(resolve));
        expectHidden();
    });
    
    it("Show displays children if location hash is the same as hash prop", async function  tw3_3_10_2(){
        window.location.hash="search";
        await new Promise(resolve => setTimeout(resolve));
        const rendersNothing= expectHidden();
        window.location.hash="details";
        await new Promise(resolve => setTimeout(resolve));
        expectShown(rendersNothing);
        window.location.hash="summary";
        await new Promise(resolve => setTimeout(resolve));
        expectHidden(rendersNothing);
    });
    
    it("Show unsubscribes event listener at teardown", async function  tw3_3_10_3(){
        function removeComments(m){ return m.toString().replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""); }
        turnOff();        
        await new Promise(resolve => setTimeout(resolve));
        expect(div.innerText).to.not.be.ok;
        expect(Show.unmounted, "the Show component must have an unmounted() method to remove the hashchange listener").to.be.ok;
        const unmountedText=removeComments(Show.unmounted.toString());
        expect(unmountedText, "the Show unmounted() method must call removeEvenListener").to.include("window.removeEventListener");
        expect(unmountedText,  "the Show unmounted() method must mention the hashchange event").to.include("hashchange");
    });
 });
