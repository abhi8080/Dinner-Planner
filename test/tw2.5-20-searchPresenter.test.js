import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import createUI from "./createUI.js";
const { render, h } = require("vue");

let SearchPresenter;
let SearchFormView;
let SearchResultsView;
const X = TEST_PREFIX;

const searchResults = [
  {
    id: 587203,
    title: "Taco Pizza",
    readyInMinutes: 20,
    servings: 6,
    sourceUrl: "https://laurenslatest.com/taco-salad-pizza-with-doritos/",
    openLicense: 0,
    image: "Taco-Salad-Pizza-with-Doritos-587203.jpg",
  },
  {
    id: 559251,
    title: "Breakfast Pizza",
    readyInMinutes: 25,
    servings: 6,
    sourceUrl: "http://www.jocooks.com/breakfast-2/breakfast-pizza/",
    openLicense: 0,
    image: "Breakfast-Pizza-559251.jpg",
  },
  {
    id: 556121,
    title: "Easy Vegetarian Sausage Basil Pizza",
    readyInMinutes: 30,
    servings: 4,
    sourceUrl: "https://dizzybusyandhungry.com/cashew-sausage-basil-pizza/",
    openLicense: 0,
    image: "Cashew-Sausage-Basil-Pizza-556121.png",
  },
];

try {
  SearchPresenter = require("../src/vuejs/" + X + "searchPresenter.js").default;
  SearchFormView = require("../src/views/" + X + "searchFormView.js").default;
  SearchResultsView = require("../src/views/" +
    X +
    "searchResultsView.js").default;
} catch (e) {}

describe("TW2.5 SearchPresenter", function () {
  this.timeout(200000);

  before(function () {
    if (!SearchPresenter || !SearchFormView || !SearchResultsView) this.skip();
    if (typeof SearchPresenter == "object") this.skip();
  });

  function expectSearchFormViewAndSecondChild(render) {
    expect(render.children.length).to.equal(2, "expected 2 children");
    expect(render.children[0].tag).to.equal(
      SearchFormView,
      "expected first child to be SearchFormView"
    );
  }

  it("Vue SearchPresenter renders SearchFormView and performs initial search", async function () {
    installOwnCreateElement();
    let searched = false;
    const renderingEmpty = SearchPresenter({
      model: {
        searchResultsPromiseState: {},
        doSearch: () => (searched = true),
      },
    });
    expectSearchFormViewAndSecondChild(renderingEmpty);
    expect(
      renderingEmpty.children[1].children.length,
      "expecting DIV to have a single (text) child, maybe you have extra spaces?"
    ).to.equal(1);
    expect(
      renderingEmpty.children[1].children[0].toLowerCase(),
      "does the text say 'no data?'"
    ).to.equal("no data");
    expect(searched).to.equal("appropriate model method not called");
  });

  it("Vue SearchPresenter renders SearchFormView and SearchResultsView", function () {
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
    expect(renderingData.children[1].tag).to.equal(
      SearchResultsView,
      "expected second child to be SearchResultsView"
    );
  });

  it("Vue SearchPresenter passes correct props and custom events to SearchFormView", function () {
    installOwnCreateElement();
    let searched, text, type;
    const renderingCustomEvent = SearchPresenter({
      model: {
        searchResultsPromiseState: { promise: "foo" },
        doSearch: () => (searched = true),
        setSearchQuery: (txt) => (text = txt),
        setSearchType: (t) => (type = t),
      },
    });
    let SearchFormViewProps = renderingCustomEvent.children[0].props;
    expect(SearchFormViewProps).to.be.ok;
    expect(
      SearchFormViewProps,
      "SearchFormView is missing a prop"
    ).to.have.property("dishTypeOptions");
    expect(JSON.stringify(SearchFormViewProps["dishTypeOptions"])).to.equal(
      JSON.stringify(["starter", "main course", "dessert"])
    );

    // test that event handlers are not prematurely called
    expect(searched, "did not expect model method to be called").to.equal(
      undefined
    );
    expect(text, "did not expect model method to be called").to.equal(
      undefined
    );
    expect(type, "did not expect model method to be called").to.equal(
      undefined
    );

    // testing event handlers
    const threeHandlers = Object.keys(SearchFormViewProps).filter(function (
      prop
    ) {
      return !["dishTypeOptions"].includes(prop);
    });

    expect(threeHandlers.length).to.equal(3, "expected 4 props in total");

    let foundOnSearch, foundOnText, foundOnDishType;
    let onSearchHandler, onTextHandler, onDishTypeHandler;

    // testing that the handlers change the right properties in the model
    threeHandlers.forEach((handler) => {
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
        [onTextHandler]: (txt) => (textChange = txt),
        [onDishTypeHandler]: (t) => (typeChange = t),
        [onSearchHandler]: () => (search = true),
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
    expect(buttons.length).to.be.greaterThan(1, "expected 1 or more buttons");
    let searchButtons = Array.from(buttons).filter(
      (btn) =>
        btn.textContent && btn.textContent.toLowerCase().includes("search")
    );
    expect(searchButtons.length).to.equal(1, "expected 1 search button");
    searchButtons[0].click();
    expect(search).to.equal(
      true,
      "SearchFormView fires its custom event correctly"
    );
  });

  it("Vue SearchPresenter passes correct props and custom events to SearchResultsView", function () {
    installOwnCreateElement();
    let dishId;
    const renderingSearchResults = SearchPresenter({
      model: {
        searchResultsPromiseState: { promise: "foo", data: "bar" },
        setCurrentDish: (id) => (dishId = id),
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

    let oneHandler = Object.keys(SearchResultsViewProps).filter(function (
      prop
    ) {
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
    expect(dishId).to.equal(
      1,
      "Search presenter custom event handler calls the appropriate model method"
    );

    let div = createUI();
    window.React = { createElement: h };
    let dish;
    render(
      h(SearchResultsView, {
        searchResults: searchResults,
        [oneHandler]: (d) => (dish = d),
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
