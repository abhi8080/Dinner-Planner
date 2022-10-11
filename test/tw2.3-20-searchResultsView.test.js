import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import {findTag,onlyAllowNativeEventNames} from "./jsxUtilities.js";

let SearchResultsView;
const X = TEST_PREFIX;
try {
  SearchResultsView = require("../src/views/" +
    X +
    "searchResultsView.js").default;
} catch (e) { console.log(e);}

describe("TW2.3 SearchResultsView", function tw2_3_20() {
  this.timeout(200000);

  before(function tw2_3_20_before() {
    if (!SearchResultsView) this.skip();
  });

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

  const searchResults2 = [
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
  ]

  function setUpView(theSearchResults = searchResults) {
    installOwnCreateElement();
    return SearchResultsView({ searchResults: theSearchResults });
  }

  it("SearchResultsView renders div", function tw2_3_20_1 () {
    const rendering = setUpView();
    expect(rendering.tag, "A DIV tag was expected").to.be.ok;
    expect(rendering.tag, "Did you forget to add a div?").to.equal("div");
  });

  it("SearchResultsView renders span for each search result", function tw2_3_20_2() {
    const rendering = setUpView();
      expect(rendering.children, "SearchResultView should render a tree").to.be.ok;
      expect(rendering.children[0].length, "SearchResultsView should render the same amount children as the number of dihses it got").to.equal(3);
      rendering.children[0].forEach(function tw2_3_20_2_testChildACB(child){
          expect(child.tag).to.be.ok;
          expect(
              child.tag,
              "Does your search results generate a span for each dish in search result? "
          ).to.equal("span");
      });
  });

  it("SearchResultsView properly performs array rendering", function tw2_3_20_2() {
      const rendering = setUpView(searchResults2);
      expect(rendering.children, "SearchResultView should render a tree").to.be.ok;
      expect(rendering.children[0].length, "SearchResultsView should accept a variable length of searchResults and must not be fixed to 3 only").to.equal(searchResults2.length);
    });

  it("SearchResultsView renders only image and title for each span", function  tw2_3_20_3() {
    const rendering = setUpView();
    rendering.children[0].forEach((child, i) => {
      expect(child.children ).to.be.ok;
      expect(
        child.children.length,
        "Does your search results have more than an image and title for each span?"
      ).to.equal(2);
      expect(child.children[0].tag).to.be.ok;
      expect(
        child.children[0].tag,
        "Is the first tag in your span an image?"
      ).to.equal("img");
      expect(child.children[1].tag);
      expect(
        child.children[1].tag,
        "Is the second tag in your span a div?"
      ).to.equal("div");
    });
  });

  it("SearchResultsView renders images correctly", function  tw2_3_20_4() {
    const rendering = setUpView();
    rendering.children[0].forEach((child, i) => {
      let image = child.children[0];
      expect(image.props).to.be.ok;
      expect(image.props.src).to.be.ok;
      expect(
        image.props.src,
        "Did you copy the correct url to get images from spoonacular?"
      ).to.equal(
        "https://spoonacular.com/recipeImages/" + searchResults[i].image
      );
      expect(image.props.height).to.be.ok;
      expect(image.props.height, "Is your image height 100?").to.equal("100");
    });
  });

  it("SearchResultsView renders titles correctly", function  tw2_3_20_5() {
    const rendering = setUpView();
    rendering.children[0].forEach((child, i) => {
      let title = child.children[1];
      expect(title.children).to.be.ok;
      expect(
        title.children.length,
        "expecting DIV to have a single (text) child, maybe you have extra spaces?"
      ).to.equal(1);
      expect(
        title.children[0],
        "The title of your dish was wrong. Did you properly access the title prop?"
      ).to.equal(searchResults[i].title);
    });
  });
  it("SearchResultsView uses correct native event names", function tw2_3_30_8() {
    installOwnCreateElement();
    const rendering= SearchResultsView({searchResults:searchResults});
    const spans=findTag("span", rendering);
    spans.forEach(span => {
        onlyAllowNativeEventNames(span);
    });
  });

});
