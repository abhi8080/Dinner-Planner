import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {findTag} from "./jsxUtilities.js";
import React from "react";
import {render} from "react-dom";
import {withMyFetch, mySearchFetch, findCGIParam, searchResults} from "./mockFetch.js";

let Show;
const X = TEST_PREFIX;

try {
  Show = require("../src/reactjs/" + X + "show.js").default;
} catch (e) { } 

describe("TW3.3 React navigation Show", function  tw3_3_21() {
    this.timeout(200000);

    const div= document.createElement("div");
    let turnOff;
    function Guard(props){
        const [state, setState]= React.useState(true);
        React.useEffect(()=> turnOff=()=>setState(false), []);
        return state && props.children;
    }
    
    before(function  tw3_3_21_before() {
        if (!Show) this.skip();
        window.React= React;
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
    
    it("Show does not render (or hides) children if location hash is different from hash prop", async function  tw3_3_21_1(){
        window.location.hash="search";
        await new Promise(resolve => setTimeout(resolve));
        expectHidden();
    });

    it("Show displays children if location hash is the same as hash prop", async function  tw3_3_21_2(){
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
    
    it("Show unsubscribes event listener at teardown", async function  tw3_3_21_3(){
        turnOff();        
        await new Promise(resolve => setTimeout(resolve));
        expect(div.innerText).to.not.be.ok;
        const oldConsoleError= console.error;
        let error;
        console.error= function(...param){
            error=[...param];
        };
        try{
            window.location.hash="search";
            await new Promise(resolve => setTimeout(resolve));
        }finally{
            console.error= oldConsoleError;
        }
        expect(error).to.not.be.ok;
    });
    


});
