import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";
import installOwnCreateElement from "./jsxCreateElement.js";

const {render, h}= require("vue");

let SidebarView;
let Sidebar;
const X= TEST_PREFIX;
try{
    SidebarView= require('../src/views/'+X+'sidebarView.js').default;
    Sidebar= require('../src/vuejs/'+X+'sidebarPresenter.js').default;
}catch(e){};

function traverseJSX({tag, props, children}){
    if(!children)
        return [{tag, props}];
    return [{tag, props}, ... children.map(child=> traverseJSX(child))].flat();
}
describe("TW1.4 Model-View-Presenter", function tw_1_4_10() {
    this.timeout(200000);  // increase to allow debugging during the test run
    
    before(function tw_1_4_10_before(){
        if(!SidebarView || !Sidebar) this.skip();
    });
    
    it("Vue Summary presenter renders SummaryView with people prop", function tw_1_4_10_1(){
        let Summary;
        let SummaryView;
        try{
        Summary= require('../src/vuejs/'+TEST_PREFIX+'summaryPresenter.js').default;
        SummaryView= require('../src/views/'+TEST_PREFIX+'summaryView.js').default;
        }catch(e){console.log(e);};

        installOwnCreateElement();
        let rendering=Summary({model: {numberOfGuests:2, dishes:[]}});

        expect(rendering.tag).to.be.ok;
        expect(rendering.tag.name).to.equal(SummaryView.name);
        expect(rendering.props).to.be.ok;
        expect(rendering.props.people, "2 guests should be passed to SummaryView").to.equal(2);

        rendering=Summary({model: {numberOfGuests:3, dishes:[]}});
        expect(rendering.tag).to.be.ok;
        expect(rendering.tag.name).to.equal(SummaryView.name);
        expect(rendering.props).to.be.ok;
        expect(rendering.props.people, "3 guests should be passed to SummaryView").to.equal(3);
    });

    it("Vue Sidebar presenter renders SidebarView with number prop", function tw_1_4_10_2(){
        installOwnCreateElement();
        let rendering=Sidebar({model:  {numberOfGuests:2, dishes:[]}});

        expect(rendering.tag).to.be.ok;
        expect(rendering.tag.name).to.equal(SidebarView.name);
        expect(rendering.props).to.be.ok;
        expect(rendering.props.number, "2 guests should be passed to SidebarView").to.equal(2);

        rendering=Sidebar({model:  {numberOfGuests:5, dishes:[]}});

        expect(rendering.tag).to.be.ok;
        expect(rendering.tag.name).to.equal(SidebarView.name);
        expect(rendering.props).to.be.ok;
        expect(rendering.props.number, "5 guests should be passed to SidebarView").to.equal(5);
    });

    it("Vue Sidebar presenter renders SidebarView with correct custom event handler", function tw_1_4_10_3(){
        installOwnCreateElement();
        let latestGuests;
        const rendering=Sidebar({
            model:{
                numberOfGuests:2,
                dishes:[],
                setNumberOfGuests(x){ latestGuests=x; }
            }
        });
        
        expect(typeof rendering.props.onNumberChange).to.equal("function");
        // we can apply the callback, the model should change!
        rendering.props.onNumberChange(3);
        expect(latestGuests, "custom event should properly ask presenter to change guests").to.equal(3);
        rendering.props.onNumberChange(5);
        expect(latestGuests, "custom event should properly ask presenter to change guests").to.equal(5);
        
    });

    /*
    it("App renders Sidebar, then Summary", function tw_1_4_10_4(){
        const Summary= require('../src/vuejs/'+TEST_PREFIX+'summaryPresenter.js').default;
        installOwnCreateElement();
        const App= require('../src/views/'+TEST_PREFIX+'app.js').default;
        const rendering= App({model: {
            numberOfGuests:2,
            dishes:[],
        }});
        expect(rendering.tag).to.equal("div");

        const components= traverseJSX(rendering).filter(function keepComponents({tag, props}){
            return typeof(tag)=="function" || typeof(tag)=="object";
        });
        expect(components.length).to.be.gte(2);
        
        expect(components[0].tag.name).to.equal(Sidebar.name);
        expect(components.find(function tw_1_4_10_4_checkSummaryCB(x){ return x.tag.name===Summary.name;}), "Summary must be rendered after Sidebar");
    });*/
});
