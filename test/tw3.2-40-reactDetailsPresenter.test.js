import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {dishInformation} from "./mockFetch.js";
import {renderWithState} from "./mockReact.js";
import {findTag} from "./jsxUtilities.js";

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
      let cleaned, added;
      const renderings= renderWithState(DetailsPresenter,{
          model: {
              currentDish: dishInformation.id,
              currentDishPromiseState:{},
              addObserver(o){added=true; o();},
              removeObserver(o){ cleaned=true;},
          }
      });
      expect(added, "presenter expected to add at least an observer").to.equal(true);
      
      const renderingEmpty= renderings[renderings.length-1].rendering;
      expect(renderingEmpty.children.length, "when there is no promise, DetailsPresenter should return a signle HTML element").to.equal(1);
      expect(renderingEmpty.children[0].toLowerCase(), "when there is no promise, DetailsPresenter should show 'no data'").to.equal("no data");
      renderings.cleanup();
      expect(cleaned, "presenter expected to remove observer(s)").to.equal(true);
      const renderings1= renderWithState(DetailsPresenter,{
          model: {
              currentDishPromiseState:{promise:"bla"},
              currentDish: dishInformation.id,
              addObserver(o){o();},
              removeObserver(o){},
          }
      });
      const renderingPromise=renderings1[renderings.length-1].rendering;
      expect(renderingPromise.tag, "when there is a promise, DetailsPresenter should render a loading image").to.equal("img");
      renderings1.cleanup();
  });
    
    it("Vue DetailsPresenter renders DetailsView", async function(){
        const renderings=renderWithState(DetailsPresenter,{
          model: {
              currentDish: dishInformation.id,
              currentDishPromiseState:{promise:"bla", data: dishInformation},
              dishes:[],
              numberOfGuests:4,
              addObserver(o){o();},
              removeObserver(o){},
          }
      });
      const renderingData= renderings[renderings.length-1].rendering;
      expect(renderingData.tag).to.equal(DetailsView, "DetailsPresenter should render DetailsView if the promise state includes data");
      expect(renderingData.props.guests).to.equal(4, "DetailsView guest prop must be read from the model");
      expect(renderingData.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be falsy with empty menu").to.not.be.ok;
      expect(renderingData.props.dishData).to.equal(dishInformation, "DetailsView dishData prop expected to be read from the currentDish promise state");
      renderings.cleanup();  

      let dishAdded;

      const renderings1=renderWithState(DetailsPresenter,{
            model: {
                currentDishPromiseState:{promise:"bla", data: dishInformation},
                currentDish: dishInformation.id,
                dishes:[dishInformation],
                numberOfGuests:5,
                addToMenu(dish){
                    dishAdded=dish;
                }, 
                addObserver(o){o();},
                removeObserver(o){},
          }
      });
      const renderingCustomEvent=renderings1[renderings.length-1].rendering;
      expect(renderingCustomEvent.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be truthy if the dish is in menu").to.be.ok;  
      expect(renderingCustomEvent.props.guests).to.equal(5, "DetailsView guest prop must be read from the model");

      // find the prop sent to DetailsView that is a function, that must be the custom event handler        
      const callbackNames= Object.keys(renderingCustomEvent.props).filter(prop=> typeof renderingCustomEvent.props[prop] =="function");
      expect(callbackNames.length, "Details presenter passes one custom event handler").to.equal(1);
      renderingCustomEvent.props[callbackNames[0]]();
      expect(dishAdded, "Details presenter custom event handler calls the appropriate model method").to.equal(dishInformation);

        // now we know the name of the custom event, and can check if it is called when the button is pressed.
        // we render JSX and press the button
        installOwnCreateElement();
        let buttonPressed;
        const detailsView=DetailsView( {
          isDishInMenu:false,
          guests:3,
          dishData:dishInformation,
          [callbackNames[0]]: function(){ buttonPressed=true;}
        });
        
        let addButton = findTag("button", detailsView).find(function(btn){
            return btn.children[0].toLowerCase().indexOf( "add")!=-1;
        });
        expect(addButton, "add button was not found").to.be.ok;
        try{
            addButton.props.onClick();
        }finally{ window.location.hash=""; }
        expect(buttonPressed, "DetailsView does not fire its custom event correctly").to.equal(true);
        renderings1.cleanup();
    });
});

