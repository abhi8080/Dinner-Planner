import { assert, expect } from "chai";
import createUI from "./createUI.js";
import installOwnCreateElement from './jsxCreateElement';
import {findTag} from "./jsxUtilities.js";

let SearchFormView;
const X = TEST_PREFIX;
try {
  SearchFormView = require("../src/views/" + X + "searchFormView.js").default;
} catch (e) {console.log(e);}

const { render, h } = require("vue");

describe("TW2.3 SearchFormView", function tw2_3_10() {
  this.timeout(200000); // increase to allow debugging during the test run

  before(function tw2_3_10_before() {
    if (!SearchFormView) this.skip();
  });

  it("SearchFormView renders required DOM tree with dishTypeOptions props", function tw2_3_10_1() {
    let div = createUI();
    window.React = { createElement: h };
    render(
      <SearchFormView
        dishTypeOptions={["starter", "main course", "dessert"]}
      />,
      div
    );
    expect(
      div.querySelectorAll("input").length,
      "Do you have 1 textbox?"
    ).to.equal(1);
    expect(
      div.querySelectorAll("select", "Do you have 1 select?").length
    ).to.equal(1);
    expect(
      div.querySelectorAll("input")[0].nextSibling.firstChild.textContent,
      "Is 'Choose:' rendered?"
    ).to.equal("Choose:");
    expect(
      div.querySelectorAll("option", "Are there 4 options rendered?").length
    ).to.equal(4);
    expect(
      div.querySelectorAll("option")[0].firstChild.textContent,
      "Is the first option 'Choose:'?"
    ).to.equal("Choose:");
    expect(
      div.querySelectorAll("option")[1].firstChild.textContent,
      "Is the second option 'starter'?"
    ).to.equal("starter");
    expect(
      div.querySelectorAll("option")[2].firstChild.textContent,
      "Is the third option 'main course'?"
    ).to.equal("main course");
      expect(
          div.querySelectorAll("option")[3].firstChild.textContent,
          "Is the third last option 'dessert'?"
         ).to.equal(
      "dessert"
    );
    expect(div.querySelectorAll("button").length, "there should be at least one button").to.be.gte(1);
      expect(div.querySelectorAll("button")[0].firstChild.textContent, "the first button text must be \"Search!\"").to.equal("Search!");
  });

  it("SearchFormView properly performs array rendering", function tw2_3_10_2() {
    function checkArrayRendering(div, dishTypes) {
    render(
      <SearchFormView
        dishTypeOptions={dishTypes}
      />,
      div
    );
    const options = div.querySelectorAll("option");
    expect(options.length, `Are there ${dishTypes.length + 1} options rendered?`).to.equal(dishTypes.length + 1);
    expect(options[0].firstChild.textContent, "Is the first option 'Choose:'?").to.equal("Choose:");
    }

    let div = createUI();
    window.React = { createElement: h };
    const dishTypes = ["starter", "main course", "dessert"];
    checkArrayRendering(div, dishTypes);

    let div2 = createUI();
    window.React = { createElement: h };
    const dishTypes2 = ["primero", "segundo", "tercero", "cuarto"];
    checkArrayRendering(div2, dishTypes2);
});

it("SearchFormView does not change props after rendering", function tw2_3_10_3() {
  installOwnCreateElement();
  const props = {dishTypeOptions:["starter", "main course", "dessert"]};
  const json = JSON.stringify(props);
  const rendering= SearchFormView(props);
  console.log(rendering);
  expect(JSON.stringify(props),"Do not change the props in the View after rendering!").to.equal(json);
});

});
