import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";
let SidebarView;
const X= TEST_PREFIX;
try{
   SidebarView= require('../src/views/'+X+'sidebarView.js').default;
}catch(e){ };

const {render, h}= require("vue");

describe("TW1.2 SidebarView", function tw1_2_20() {
    this.timeout(200000);  // increase to allow debugging during the test run

    before(function(){
        if(!SidebarView) this.skip();
    });

    it("SidebarView shows its number prop", function tw1_2_20_1(){
        let div= createUI();
        window.React={createElement:h};
        render(<SidebarView number={4} dishes={[]}/>, div);
        assert.equal(div.querySelectorAll("button").length, 2, "SidebarView should have only 2 buttons");
        assert.equal(div.querySelectorAll("button")[0].disabled, false, "SidebarView's first button should be enabled");
        assert.equal(div.querySelectorAll("button")[0].firstChild.textContent, "-", "SidebarView's first button should have text '-'");
        assert.equal(div.querySelectorAll("button")[1].firstChild.textContent, "+", "SidebarView's second button should have text '+'");
        assert.equal(div.querySelectorAll("button")[0].nextSibling.textContent, "4", "SidebarView should show its number prop, in this case, 4");

    });
    it("SidebarView minus button should be disabled if number prop is 1", function tw1_2_20_2(){
        let div= createUI();
        window.React={createElement:h};
        render(<SidebarView number={1} dishes={[]}/>, div);
        assert.equal(div.querySelectorAll("button").length, 2, "SidebarView should have only 2 buttons");
        assert.equal(div.querySelectorAll("button")[0].firstChild.textContent, "-", "SidebarView's first button should have text '-'");
        assert.equal(div.querySelectorAll("button")[0].disabled, true, "SidebarView's first button should be disabled");
        assert.equal(div.querySelectorAll("button")[1].firstChild.textContent, "+", "SidebarView's second button should have text '+'");
        assert.equal(div.querySelectorAll("button")[0].nextSibling.textContent, "1", "SidebarView should show its number prop, in this case, 1");
        
    });

});
