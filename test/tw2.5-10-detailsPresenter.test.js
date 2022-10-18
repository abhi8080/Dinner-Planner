import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import createUI from './createUI.js';
const { render, h } = require('vue');
import {dishInformation} from "./mockFetch.js";

let DetailsPresenter;
let DetailsView;
const X = TEST_PREFIX;
try {
    DetailsPresenter = require("../src/vuejs/" + X + "detailsPresenter.js").default;
    DetailsView = require("../src/views/" + X + "detailsView.js").default;
} catch(e) { };

describe("TW2.5 DetailsPresenter", function tw2_5_10() {
  this.timeout(200000);

  before(function tw2_5_10_before(){
    if(!DetailsPresenter) this.skip();
  });

  it("Vue DetailsPresenter renders promise states correctly", async function tw2_5_10_1(){
    installOwnCreateElement();
      const renderingEmpty= DetailsPresenter({model: {
          currentDish: dishInformation.id,
          currentDishPromiseState:{}
      }
                                             });
      expect(renderingEmpty.children.length, "when there is no promise, DetailsPresenter should return a signle HTML element").to.equal(1);
      expect(renderingEmpty.children[0].toLowerCase(), "when there is no promise, DetailsPresenter should show 'no data'").to.equal("no data");
      
      const renderingPromise=DetailsPresenter({model: {currentDishPromiseState:{promise:"bla"}}});
      expect(renderingPromise.tag, "when there is a promise, DetailsPresenter should render a loading image").to.equal("img");
  });
    it("Vue DetailsPresenter renders DetailsView", async function tw2_5_10_2(){
      installOwnCreateElement();
      const renderingData= DetailsPresenter({
          model: {
              currentDishPromiseState:{promise:"bla", data: dishInformation},
              currentDish: dishInformation.id,
              dishes:[],
              numberOfGuests:4,
          }
      });
      expect(renderingData.tag).to.equal(DetailsView, "DetailsPresenter should render DetailsView if the promise state includes data");
      expect(renderingData.props.guests).to.equal(4, "DetailsView guest prop must be read from the model");
      expect(renderingData.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be falsy with empty menu").to.not.be.ok;
      expect(renderingData.props.dishData).to.equal(dishInformation, "DetailsView dishData prop expected to be read from the currentDish promise state");


      let dishAdded;
      const renderingCustomEvent=DetailsPresenter({
          model: {
              currentDishPromiseState:{promise:"bla", data: dishInformation},
              currentDish: dishInformation.id,
              dishes:[dishInformation],
              numberOfGuests:5,
              addToMenu(dish){
                  dishAdded=dish;
              }
          }
      });
      expect(renderingCustomEvent.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be truthy if the dish is in menu").to.be.ok;  
      expect(renderingCustomEvent.props.guests).to.equal(5, "DetailsView guest prop must be read from the model");

      // find the prop sent to DetailsView that is a function, that must be the custom event handler        
        const callbackNames= Object.keys(renderingCustomEvent.props).filter(function tw2_5_10_2_testCallbackCB(prop){return typeof renderingCustomEvent.props[prop] =="function";});
       expect(callbackNames.length, "Details presenter passes one custom event handler").to.equal(1);
      renderingCustomEvent.props[callbackNames[0]]();
      expect(dishAdded, "Details presenter custom event handler calls the appropriate model method").to.equal(dishInformation);

        // now we know the name of the custom event, and can check if it is called when the button is pressed.
        // we render in DOM and press the button
      let div = createUI();
        window.React = { createElement: h };
      let buttonPressed;
        render(h(DetailsView, {
          isDishInMenu:false,
          guests:3,
          dishData:dishInformation,
          [callbackNames[0]]: function(){ buttonPressed=true;}
      }), div
            );
        
        let addButton = [...div.querySelectorAll("button")].find(function(btn){
            return btn.innerText.toLowerCase().indexOf( "add")!=-1;
        });
        expect(addButton, "add button was not found").to.be.ok;
        try{
            addButton.click();
        }finally{
            window.location.hash="";
            render(h("div"), div);
        }
        expect(buttonPressed, "DetailsView does not fire its custom event correctly").to.equal(true);

    });
});

