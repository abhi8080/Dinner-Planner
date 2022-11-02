import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";
import installOwnCreateElement from "./jsxCreateElement.js";
import {findTag,onlyAllowNativeEventNames} from "./jsxUtilities.js";


let SidebarView;
const X= TEST_PREFIX;
try{
   SidebarView= require('../src/views/'+X+'sidebarView.js').default;
}catch(e){};

const {render, h}= require("vue");

describe("TW1.3 SidebarView events", function tw1_3_10() {
    this.timeout(200000);  // increase to allow debugging during the test run

    before(function(){
        if(!SidebarView) this.skip();
    });

    it("SidebarView handles native events (click)", function tw1_3_10_1(){
        let div= createUI();
        let newNumber;
        let customEventTest= false;
        window.React={createElement:h};
        render(<SidebarView number={4} dishes={[]} onNumberChange={function(nr){
            newNumber=nr;
            customEventTest=true;
        }}/>, div);

        let minusMsg;
        let plusMsg;
        let oldConsole= console;
        window.console={ log: function(x){ minusMsg=x;}};
        div.querySelectorAll("button")[0].click();
        console=oldConsole;

        if(!customEventTest){
            window.console={ log: function(x){ plusMsg=x;}};
            div.querySelectorAll("button")[1].click();
            console=oldConsole;
            expect(minusMsg, "minus button native event is not functioning").to.be.ok;
            expect(plusMsg, "plus button native event is not functioning").to.be.ok;
            expect(minusMsg, "each button should console.log different messages").to.not.equal(plusMsg);
        }
    });

    it("SidebarView fires onNumberChange custom event", function tw1_3_10_2(){
        let div= createUI();
        window.React={createElement:h};
        let newNumber;
        render(<SidebarView number={4} dishes={[]} onNumberChange={function(nr){
            newNumber=nr;
        }}/>, div);

        div.querySelectorAll("button")[0].click();

        expect(newNumber).to.equal(3);
        
        div.querySelectorAll("button")[1].click();
        expect(newNumber).to.equal(5);
    });

    it("SidebarView does not change its props during rendering", function tw1_3_10_3(){
        installOwnCreateElement();
        const props = {number: 4, dishes: []};
        const json = JSON.stringify(props);
        const rendering= SidebarView(props);
        expect(JSON.stringify(props),"SidebarView doesn't change its props during render").to.equal(json);
    });

    it("SidebarView uses correct native event names", function tw132_10_4(){
        installOwnCreateElement();
        const rendering= SidebarView({number:2, dishes:[]});
        const buttons=findTag("button", rendering);
        buttons.forEach(button => {
            onlyAllowNativeEventNames(button);
        });
    });

            
});
