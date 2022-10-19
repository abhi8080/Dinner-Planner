import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement.js";
import {findTag, allChildren, searchProperty, onlyAllowNativeEventNames} from "./jsxUtilities.js";


import {dishInformation} from "./mockFetch.js";

let DetailsView;
const X = TEST_PREFIX;
try {
  DetailsView = require("../src/views/" + X + "detailsView.js").default;
} catch (e) { }

describe("TW2.3 DetailsView", function tw2_3_30() {
  this.timeout(200000);

  let rendering, jsxChildren;
  let guests = 3;
  let disabled = true;

  before(function tw2_3_30_before() {
      if (!DetailsView) this.skip();
      else {
          installOwnCreateElement();
          rendering= DetailsView({dishData:dishInformation,guests:guests,isDishInMenu:{disabled}});
          jsxChildren = allChildren(rendering);
    }
  });

  function ceilAndFloor(num) {
    return [Math.floor(num), Math.ceil(num)];
  }

  it("DetailsView renders dish price", function tw2_3_30_1() {
    expect(
      searchProperty(
        jsxChildren,
        "textContent",
        ceilAndFloor(dishInformation["pricePerServing"])
      ),
      "The price of the dish is not rendered."
    ).to.be.ok;
  });

  it("DetailsView renders correct total price for all guests", function tw2_3_30_2() {
    expect(
      searchProperty(
        jsxChildren,
        "textContent",
        ceilAndFloor(dishInformation["pricePerServing"] * guests)
      ),
      "pricePerServings is multiplied by the number of guests"
    ).to.be.ok;
  });

  it("DetailsView renders all ingredients (name, amount, measurement unit)", function tw2_3_30_3() {
      dishInformation["extendedIngredients"].forEach(function tw2_3_30_3_checkIngredientCB(ingredient) {
      expect(
        searchProperty(jsxChildren, "textContent", [ingredient["name"]]),
        "ingredient names must be displayed"
      ).to.be.ok;

      expect(
        searchProperty(jsxChildren, "textContent", [
          ingredient["amount"],
          ingredient["amount"].toFixed(2),
        ]),
        "Are the ingredient amounts showing 2 decimal places?"
      ).to.be.ok;

      expect(
        searchProperty(jsxChildren, "textContent", [ingredient["unit"]]),
        "Measurement units are not showing"
      ).to.be.ok;
    });
  });

  it("DetailsView renders instruction", function tw2_3_30_4() {
    expect(
      searchProperty(jsxChildren, "textContent", [
        dishInformation["instructions"].slice(0, 30),
      ])
        , "Cooking instructions not found"
    ).to.be.ok;
  });

  it("DetailsView has link to recipe", function tw2_3_30_5() {
    expect(
        searchProperty(jsxChildren, "href", [dishInformation["sourceUrl"]], "a", true)
        , "link to original recipe not found"  
    ).to.be.ok;
  });

    it("DetailsView renders dish image", function tw2_3_30_6() {
        expect(
        searchProperty(jsxChildren, "src", [dishInformation["image"]], "img", true)
        , "link to original recipe not found"  
    ).to.be.ok;
  });

 it("DetailsView has button to add to menu, disabled if dish is in menu", function tw2_3_30_7() {
     const buttons=findTag("button", rendering);
     let addToMenuButton;
     buttons.forEach(button => {
         if (
             (button.children[0].toLowerCase().includes("add") ||
              button.children[0].toLowerCase().includes("menu"))
         ) {
             addToMenuButton = button;
         }
     });
     expect(addToMenuButton, "add to menu button not found").to.not.be.undefined;
     expect(addToMenuButton.props.disabled.disabled,       "button must be disabled if the dish is already in the menu").to.equal(disabled);
 });

  it("DetailsView does not change its props during rendering", function tw2_3_30_8() {
    installOwnCreateElement();
    const props = {dishData: dishInformation, guests: guests, isDishInMenu: disabled};
    const json = JSON.stringify(props);
    DetailsView(props);
    expect(JSON.stringify(props),"DetailsView doesn't change its props during render").to.equal(json);

  });
  it("DetailsView uses correct native event names", function tw2_3_30_9() {
    const buttons=findTag("button", rendering);
    buttons.forEach(button => {
        onlyAllowNativeEventNames(button);
    });
   });

});
