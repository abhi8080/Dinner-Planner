import { assert, expect } from "chai";
import createUI from "./createUI";
import installOwnCreateElement from "./jsxCreateElement.js";
import {findTag,onlyAllowNativeEventNames} from "./jsxUtilities.js";


import {dishInformation} from "./mockFetch.js";

let DetailsView;
const X = TEST_PREFIX;
try {
  DetailsView = require("../src/views/" + X + "detailsView.js").default;
} catch (e) {console.log(e);}

const { render, h } = require("vue");

describe("TW2.3 DetailsView", function tw2_3_30() {
  this.timeout(200000);

  let div, divChildren;
  let guests = 3;
  let disabled = true;

  before(function tw2_3_30_before() {
    if (!DetailsView) this.skip();
    else {
      div = createUI();
      window.React = { createElement: h };
      render(
        <DetailsView
          dishData={dishInformation}
          guests={guests}
          isDishInMenu={disabled}
        />,
        div
      );
      divChildren = allChildren(div);
    }
  });

  function allChildren(node) {
    let children = [node];
    node.childNodes.forEach(function tw2_3_30_concatChildCB(childNode){
        children = children.concat(allChildren(childNode));
    });
    return children;
  }

  // Returns true if there is a node in nodes whose property property
  // which contain a query from queries.
  function searchProperty(nodes, property, queries, strictEqual = false) {
    if (!strictEqual)
      return nodes.some(
          function tw2_3_30_checkNodeCB(node){
              return node[property] &&
                  queries.some(function tw2_3_30_checkQueryCB(query){
                      return  node[property]
                          .toLowerCase().includes(query.toString().toLowerCase());
                  });
          });
      else
          return nodes.some(
              function tw2_3_30_checkNodeCB2(node){
                  return node[property] &&
                      queries.some(function tw2_3_30_checkQueryCB2(query){return node[property] === query.toString();});
              });
  }

  function ceilAndFloor(num) {
    return [Math.floor(num), Math.ceil(num)];
  }

  it("DetailsView renders dish price", function tw2_3_30_1() {
    expect(
      searchProperty(
        divChildren,
        "textContent",
        ceilAndFloor(dishInformation["pricePerServing"])
      ),
      "The price of the dish is not rendered."
    ).to.be.ok;
  });

  it("DetailsView renders correct total price for all guests", function tw2_3_30_2() {
    expect(
      searchProperty(
        divChildren,
        "textContent",
        ceilAndFloor(dishInformation["pricePerServing"] * guests)
      ),
      "pricePerServings is multiplied by the number of guests"
    ).to.be.ok;
  });

  it("DetailsView renders all ingredients (name, amount, measurement unit)", function tw2_3_30_3() {
      dishInformation["extendedIngredients"].forEach(function tw2_3_30_3_checkIngredientCB(ingredient) {
      expect(
        searchProperty(divChildren, "textContent", [ingredient["name"]]),
        "ingredient names must be displayed"
      ).to.be.ok;

      expect(
        searchProperty(divChildren, "textContent", [
          ingredient["amount"],
          ingredient["amount"].toFixed(2),
        ]),
        "Are the ingredient amounts showing 2 decimal places"
      ).to.be.ok;

      expect(
        searchProperty(divChildren, "textContent", [ingredient["unit"]]),
        "Measurement units are not showing"
      ).to.be.ok;
    });
  });

  it("DetailsView renders instruction", function tw2_3_30_4() {
    expect(
      searchProperty(divChildren, "textContent", [
        dishInformation["instructions"].slice(0, 30),
      ])
        , "Cooking instructions not found"
    ).to.be.ok;
  });

  it("DetailsView has link to recipe", function tw2_3_30_5() {
    expect(
      searchProperty(divChildren, "href", [dishInformation["sourceUrl"]], true)
        , "link to original recipe not found"  
    ).to.be.ok;
  });

  it("DetailsView renders dish image", function tw2_3_30_6() {
    let dishImage;
    div.querySelectorAll("img").forEach(function  tw2_3_30_6_findImage(img) {
      if (img.src && img.src === dishInformation["image"]) {
        dishImage = img;
      }
    });
    expect(dishImage, "dish image not found").to.not.be.undefined;
  });

  it("DetailsView has button to add to menu, disabled if dish is in menu", function tw2_3_30_7() {
    let addToMenuButton;
    div.querySelectorAll("button").forEach(function  tw2_3_30_7_findButton(button){
      if (
        button.textContent &&
        (button.textContent.toLowerCase().includes("add") ||
          button.textContent.toLowerCase().includes("menu"))
      ) {
        addToMenuButton = button;
      }
    });
    expect(addToMenuButton, "add to menu button not found").to.not.be.undefined;
    expect(addToMenuButton.disabled,       "button must be disabled if the dish is already in the menu").to.equal(disabled);
  });

  it("DetailsView does not change its props during rendering", function tw2_3_30_8() {
    installOwnCreateElement();
    const props = {dishData: dishInformation, guests: guests, isDishInMenu: disabled};
    const json = JSON.stringify(props);
    const rendering= DetailsView(props);
    expect(JSON.stringify(props),"DetailsView doesn't change its props during render").to.equal(json);

  });
  it("DetailsView uses correct native event names", function tw2_3_30_9() {
    installOwnCreateElement();
    const rendering= DetailsView({dishData:dishInformation,guests:guests,isDishInMenu:{disabled}})
    const buttons=findTag("button", rendering);
    buttons.forEach(button => {
        onlyAllowNativeEventNames(button);
    });
   });

});
