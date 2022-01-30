import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";
import installOwnCreateElement from "./jsxCreateElement.js";

const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

const Summary= require('../src/vuejs/'+TEST_PREFIX+'summaryPresenter.js').default;
const SummaryView= require('../src/views/'+TEST_PREFIX+'summaryView.js').default;

const App= require('../src/views/'+TEST_PREFIX+'app.js').default;

const VueRoot=require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").default;

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
describe("TW1.4 Model-View-Presenter", function() {
    this.timeout(200000);  // increase to allow debugging during the test run
    
    before(function(){
        if(!SidebarView || !Sidebar) this.skip();
    });
    
    it("Vue Summary presenter renders SummaryView with people prop", function(){
        installOwnCreateElement();
        const render=Summary({model: new DinnerModel()});

        expect(render.tag).to.be.ok;
        expect(render.tag.name).to.equal(SummaryView.name);
        expect(render.props).to.be.ok;
        expect(render.props.people).to.equal(2);
    });

    it("Vue Sidebar presenter renders SidebarView with number prop", function(){
        installOwnCreateElement();
        expect(Sidebar).to.be.ok;
        const render=Sidebar({model: new DinnerModel()});

        expect(render.tag).to.be.ok;
        expect(render.tag.name).to.equal(SidebarView.name);
        expect(render.props).to.be.ok;
        expect(render.props.number).to.equal(2);
    });

    it("Vue Sidebar presenter renders SidebarView with correct custom event handler", function(){
        installOwnCreateElement();
        expect(Sidebar);
        const model= new DinnerModel();
        const render=Sidebar({model});

        expect(typeof render.props.onNumberChange).to.equal("function");
        // we can apply the callback, the model should change!
        render.props.onNumberChange(3);
        expect(model.numberOfGuests).to.equal(3);
        render.props.onNumberChange(5);
        expect(model.numberOfGuests).to.equal(5);
        
    });

    it("App renders Sidebar, then Summary", function(){
        installOwnCreateElement();
        const render= App({model: new DinnerModel()});
        expect(render.tag).to.equal("div");

        const components= traverseJSX(render).filter(function keepComponents({tag, props}){
            return typeof(tag)=="function" || typeof(tag)=="object";
        });
        expect(components.length).to.be.gte(2);
        
        expect(components[0].tag.name).to.equal(Sidebar.name);
        expect(components.find(function checkSummaryCB(x){ return x.tag.name===Summary.name;}), "Summary must be rendered after Sidebar");
    });

    it("Integration test: pressing UI buttons changes number in Model", async function(){
        let div= createUI();
        window.React={createElement:h};

        render(<VueRoot />,div);
        let myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;

        expect(div.querySelector('span[title]').firstChild.textContent).to.equal("2");
        div.querySelectorAll("button")[0].click();
        expect(myModel.numberOfGuests).to.equal(1);

        await new Promise(resolve => setTimeout(resolve));  // need to wait a bit for UI to update...   
        expect(div.querySelector('span[title]').firstChild.textContent).to.equal("1");

        div.querySelectorAll("button")[1].click();
        expect(myModel.numberOfGuests).to.equal(2);
        await new Promise(resolve => setTimeout(resolve));
        expect(div.querySelector('span[title]').firstChild.textContent).to.equal("2");
    });
    
});
