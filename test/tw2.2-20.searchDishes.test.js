const { assert, expect } = require("chai");
import {withMyFetch, checkFetchUrl, mySearchFetch} from "./mockFetch.js";

let searchDishes;
const X = TEST_PREFIX;
try {
  const dishSource = require("../src/" + X + "dishSource.js");
  if (dishSource.searchDishes) searchDishes = dishSource.searchDishes;
  else searchDishes = dishSource.default.searchDishes;
} catch (e) { }

describe("TW2.2 searchDishes", function tw2_2_20() {
  this.timeout(200000);

  before(function tw2_2_20_before() {
    if (!searchDishes) this.skip();
  });

  function testPromise(text, p, searchq) {
      it(text, async function tw2_2_20_testPromise() {
          await withMyFetch(mySearchFetch, p);
          
          checkFetchUrl(mySearchFetch.lastFetch, mySearchFetch.lastParam, [-1027221439, -1197960769], searchq);

      }).timeout(4000);
  }
    testPromise("searchDishes pizza as main course",
                function tw2_2_20_testPromise1(){return searchDishes({ query: "pizza", type: "main course" });},
                [-1894851277, 1758563338]
               );
    testPromise("searchDishes strawberry pie as dessert",
                function tw2_2_20_testPromise1(){return searchDishes({ query: "strawberry pie", type: "dessert" });},
                [1496539523,-1015451899]
               );
});
