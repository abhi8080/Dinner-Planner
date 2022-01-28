import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";

const SummaryView= require('../src/views/'+TEST_PREFIX+'summaryView.js').default;

const {render, h}= require("vue");

describe("TW1.2 SummaryView", function() {
    this.timeout(200000);  // increase to allow debugging during the test run
    

    it("SummaryView shows its people prop", function(){
        const div= createUI();
        window.React={createElement:h};
        render(<SummaryView people={4} ingredients={[]} />, div);
        assert.equal(div.firstElementChild.firstElementChild.firstChild.textContent, "4");
    });
});
