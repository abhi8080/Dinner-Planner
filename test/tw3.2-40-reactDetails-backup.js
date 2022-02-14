import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {dishInformation} from "./mockFetch.js";
import {renderWithState} from "./mockReact.js";
import {findTag, prepareViewWithCustomEvents} from "./jsxUtilities.js";

let DetailsPresenter;
let DetailsView;
const X = TEST_PREFIX;
try {
    DetailsPresenter = require("../src/reactjs/" + X + "detailsPresenter.js").default;
    DetailsView = require("../src/views/" + X + "detailsView.js").default;
} catch(e) {};

describe("TW3.2 React Details presenter (observer)", function() {
  this.timeout(200000);

  before(function(){
    if(!DetailsPresenter) this.skip();
  });

  it("React DetailsPresenter renders promise states correctly", async function(){
      let cleaned, observer;
      const model={
          currentDish: dishInformation.id,
          currentDishPromiseState:{},
          addObserver(o){observer=o;},
          removeObserver(o){ cleaned=true;},
      };
      
      const renderings= renderWithState(DetailsPresenter,{model});
      expect(observer, "presenter expected to add at least an observer").to.be.ok;
      
      const renderingEmpty= renderings[renderings.length-1].rendering;
      expect(renderingEmpty.children.length, "when there is no promise, DetailsPresenter should return a signle HTML element").to.equal(1);
      expect(renderingEmpty.children[0].toLowerCase(), "when there is no promise, DetailsPresenter should show 'no data'").to.equal("no data");

      model.currentDishPromiseState.promise="bla";
      observer();
      const renderingPromise=renderings[renderings.length-1].rendering;
      expect(renderingPromise.tag, "when there is a promise, DetailsPresenter should render a loading image").to.equal("img");
      
      renderings.cleanup();
      expect(cleaned, "presenter expected to remove observer(s)").to.equal(true);
  });
    
    it("React DetailsPresenter renders DetailsView", async function(){
        let observer;
        let dishAdded;
        const model={
            currentDish: dishInformation.id,
            currentDishPromiseState:{promise:"bla", data: dishInformation},
            dishes:[],
            numberOfGuests:4,
            addObserver(o){observer=o;},
            removeObserver(o){},
            addToMenu(dish){
                dishAdded=dish;
            }, 
        };
      const renderings=renderWithState(DetailsPresenter,{ model});
      const renderingData= renderings[renderings.length-1].rendering;
      expect(renderingData.tag).to.equal(DetailsView, "DetailsPresenter should render DetailsView if the promise state includes data");
      expect(renderingData.props.guests).to.equal(4, "DetailsView guest prop must be read from the model");
      expect(renderingData.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be falsy with empty menu").to.not.be.ok;
      expect(renderingData.props.dishData).to.equal(dishInformation, "DetailsView dishData prop expected to be read from the currentDish promise state");
      renderings.cleanup();  


      model.dishes=[dishInformation];
      model.numberOfGuests=5;
      observer();
        
      const renderingCustomEvent=renderings[renderings.length-1].rendering;
      expect(renderingCustomEvent.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be truthy if the dish is in menu").to.be.ok;  
      expect(renderingCustomEvent.props.guests).to.equal(5, "DetailsView guest prop must be read from the model");

      const {customEventNames}=prepareViewWithCustomEvents(
            DetailsView, {
                isDishInMenu:false,
                guests:3,
                dishData:dishInformation,
            },
            function findButton(rendering){
                return findTag("button", rendering).filter(function(btn){
                    return btn.children[0].toLowerCase().indexOf( "add")!=-1;
                });
            }
        );
        
      expect(renderingCustomEvent.props[customEventNames[0]], "menu-adding custom event prop should be a function").to.be.a("Function");
      renderingCustomEvent.props[customEventNames[0]]();
      expect(dishAdded, "Details presenter custom event handler calls the appropriate model method").to.equal(dishInformation);
        
      renderings.cleanup();
    });
});

