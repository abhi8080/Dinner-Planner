import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import createUI from "./createUI.js";
const { render, h } = require("vue");

let SearchPresenter;
let SearchFormView;
let SearchResultsView;
const X = TEST_PREFIX;

import {searchResults} from "./mockFetch.js";

try {
  SearchPresenter = require("../src/vuejs/" + X + "searchPresenter.js").default;
  SearchFormView = require("../src/views/" + X + "searchFormView.js").default;
  SearchResultsView = require("../src/views/" + X + "searchResultsView.js").default;
} catch (e) { }

describe("TW2.5 SearchPresenter", function tw2_5_20() {
  this.timeout(200000);

  before(function tw2_5_20_before() {
    if (!SearchPresenter || !SearchFormView || !SearchResultsView) this.skip();
    if (typeof SearchPresenter == "object") this.skip();
  });

  function expectSearchFormViewAndSecondChild(render) {
    expect(render.children.length, "expected 2 children").to.equal(2);
    expect(render.children[0].tag).to.equal(
      SearchFormView,
      "expected first child to be SearchFormView"
    );
  }

  it("Vue SearchPresenter renders SearchFormView and performs initial search", async function tw2_5_20_1() {
    installOwnCreateElement();
    let searched = false;
    const renderingEmpty = SearchPresenter({
      model: {
        searchResultsPromiseState: {},
        doSearch(){searched = true;},
      },
    });
    expectSearchFormViewAndSecondChild(renderingEmpty);
    expect(
      renderingEmpty.children[1].children.length,
      "expecting DIV to have a single (text) child, must not have any extra spaces"
    ).to.equal(1);
    expect(
      renderingEmpty.children[1].children[0].toLowerCase(),
      "does the text say 'no data?'"
    ).to.equal("no data");
    expect(searched, "search presenter must perform a search at first render").to.be.ok;
  });

  it("Vue SearchPresenter renders SearchFormView and SearchResultsView", function tw2_5_20_2() {
    installOwnCreateElement();
    const renderingData = SearchPresenter({
      model: {
        searchResultsPromiseState: {
          promise: "foo",
          data: "bar",
        },
      },
    });
    expectSearchFormViewAndSecondChild(renderingData);
    expect(renderingData.children[1].tag, "expected second child to be SearchResultsView").to.equal(
      SearchResultsView);
  });

  it("Vue SearchPresenter passes correct props and custom events to SearchFormView", function tw2_5_20_3() {
    installOwnCreateElement();
    let searched, text, type;
    const renderingCustomEvent = SearchPresenter({
      model: {
        searchResultsPromiseState: { promise: "foo" },
        doSearch(){searched = true; },
        setSearchQuery(txt){text = txt;},
        setSearchType(t){type = t;},
      },
    });
    let SearchFormViewProps = renderingCustomEvent.children[0].props;
    expect(SearchFormViewProps, "The SearchFormView should have props").to.be.ok;
    expect(SearchFormViewProps,"SearchFormView is missing prop dishTypeOptions").to.have.property("dishTypeOptions");
    expect(JSON.stringify(SearchFormViewProps["dishTypeOptions"]), "the options passed are not correct").to.equal(JSON.stringify(["starter", "main course", "dessert"]));

    // test that event handlers are not prematurely called
    expect(searched, "did not expect model method to be called").to.not.be.ok;
    expect(text, "did not expect model method to be called").to.not.be.ok;
    expect(type, "did not expect model method to be called").to.not.be.ok;

    // testing event handlers
    const threeHandlers = Object.keys(SearchFormViewProps).filter(function tw2_5_20_3_checkPropCB(prop) {
      return !["dishTypeOptions"].includes(prop);
    });

    expect(threeHandlers.length, "expected 4 props in total").to.equal(3);

    let foundOnSearch, foundOnText, foundOnDishType;
    let onSearchHandler, onTextHandler, onDishTypeHandler;

    // testing that the handlers change the right properties in the model
    threeHandlers.forEach(function tw2_5_20_3_checkHandlerCB(handler){
      expect(typeof SearchFormViewProps[handler]).to.equal(
        "function",
        "expected custom event handlers to be functions"
      );
      searched = undefined;
      text = undefined;
      type = undefined;
      SearchFormViewProps[handler]("main course");
      expect(
        searched || text || type,
        "custom events handlers should call appropriate model methods"
      );
      // getting names of handlers
      if (searched) {
        foundOnSearch = searched;
        onSearchHandler = handler;
      }
      if (text) {
        onTextHandler = handler;
        foundOnText = text;
      }
      if (type) {
        onDishTypeHandler = handler;
        foundOnDishType = type;
      }
    });
    expect(
      foundOnSearch && foundOnText && foundOnDishType,
      "custom event handlers should call appropriate model methods"
    );

    // testing that the view fires custom events
    let div = createUI();
    window.React = { createElement: h };
    let textChange, typeChange, search;
    render(
      h(SearchFormView, {
        dishTypeOptions: ["starter", "main course", "dessert"],
        [onTextHandler]: function tw2_5_20_3_onTextHandler(txt) {textChange = txt;},
        [onDishTypeHandler]:function tw2_5_20_3_onDishTypeHandler(t){typeChange = t;},
        [onSearchHandler]:function tw2_5_20_3_onSearchHandler(){search = true;},
      }),
      div
    );

    let inputs = div.querySelectorAll("input");
    expect(inputs.length).to.equal(1, "expected exactly 1 input element");
    let input = inputs[0];
    input.value = "pizza";
    input.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    expect(textChange).to.equal(
      "pizza",
      "SearchFormView fires its custom event correctly"
    );

    let selects = div.querySelectorAll("select");
    expect(selects.length).to.equal(1, "expected exactly 1 select element");
    let select = selects[0];
    select.value = "starter";
    select.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    expect(typeChange).to.equal(
      "starter",
      "SearchFormView fires its custom event correctly"
    );

    let buttons = div.querySelectorAll("button");
    expect(buttons.length).to.be.gte(1, "expected 1 or more buttons");
      let searchButtons = Array.from(buttons).filter(
          function tw2_5_20_3_checkButtonCB(btn) {
              return btn.textContent && btn.textContent.toLowerCase().includes("search");
          });
    expect(searchButtons.length).to.equal(1, "expected 1 search button");
    searchButtons[0].click();
    expect(search).to.equal(
      true,
      "SearchFormView fires its custom event correctly"
    );
  });

  it("Vue SearchPresenter passes correct props and custom events to SearchResultsView", function tw2_5_20_4() {
    installOwnCreateElement();
    let dishId;
    const renderingSearchResults = SearchPresenter({
      model: {
        searchResultsPromiseState: { promise: "foo", data: "bar" },
          setCurrentDish(id) {dishId = id;},
      },
    });
    let SearchResultsViewProps = renderingSearchResults.children[1].props;
    expect(SearchResultsViewProps).to.be.ok;
    expect(
      SearchResultsViewProps,
      "SearchResultsView is missing a prop"
    ).to.have.property("searchResults");
    expect(SearchResultsViewProps["searchResults"]).to.equal(
      "bar",
      "searchResults prop does not equal data in promise"
    );

    // test that event handlers are not prematurely called
    expect(dishId, "did not expect model method to be called").to.equal(
      undefined
    );

    let oneHandler = Object.keys(SearchResultsViewProps).filter(function tw2_5_20_4_checkPropCB(prop) {
      return !["searchResults"].includes(prop);
    });
    expect(oneHandler.length).to.equal(1, "expected 2 props in total");
    oneHandler = oneHandler[0];
    expect(
      typeof SearchResultsViewProps[oneHandler],
      "expected prop to be a function"
    ).to.equal("function");

    dishId = undefined;
    SearchResultsViewProps[oneHandler]({ id: 1 });
    expect(dishId, "Search presenter custom event handler calls the suitable model method").to.equal(1);

    let div = createUI();
    window.React = { createElement: h };
    let dish;
    render(
      h(SearchResultsView, {
        searchResults: searchResults,
        [oneHandler]: function tw2_5_20_4_oneHanlder(d){dish = d;},
      }),
      div
    );
    // SearchResultsView rendering spans should already be tested.
    let clickableSpan = div.querySelectorAll("span")[0];
    expect(clickableSpan, "span for search result not found").to.be.ok;
    clickableSpan.click();
    expect(
      dish,
      `expected dish parameter passed to ${oneHandler} to have property id`
    ).to.have.property("id");
    expect(dish.id).to.equal(
      587203,
      "SearchResultsView fires its custom event correctly"
    );
  });
});
