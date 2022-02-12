import { expect } from "chai";

let DinnerModel;
const X = TEST_PREFIX;
try {
  DinnerModel = require("../src/" + X + "DinnerModel.js").default;
} catch (e) {}

describe("TW2.4 Search dishes Promise State", function () {
  this.timeout(200000);

  before(function () {
    if (!DinnerModel) this.skip();
  });

  let model;
  this.beforeEach(function () {
    model = new DinnerModel();
  });

  it("Model sets the searchParams for search query and type", function () {
    expect(
      model,
      "Did you correctly add searchParams to your model?"
    ).to.have.property("searchParams");
      expect(JSON.stringify(model.searchParams), "paramter expeted to be empty").to.equal(JSON.stringify({}));
    model.setSearchQuery("pizza");
    model.setSearchType("main course");
    expect(
      model.searchParams,
      "Does searchParams have a query property?"
    ).to.have.property("query");
    expect(
      model.searchParams,
      "Does searchParams have a type property?"
    ).to.have.property("type");
    expect(
      model.searchParams.query,
      "Is query in searchParams a string?"
    ).to.be.a("string");
    expect(
      model.searchParams.type,
      "Is type in searchParams a string?"
    ).to.be.a("string");
    expect(
      model.searchParams.query,
      "Did you properly set the query property of searchParams?"
    ).to.be.equal("pizza");
    expect(
      model.searchParams.type,
      "Did you properly set the type property of searchParams?"
    ).to.be.equal("main course");
  });

  it("Model doSearch uses with default parameters taken from model.searchParams", async function () {
    expect(
      model,
      "Does your model have a searchResultsPromiseState?"
    ).to.have.property("searchResultsPromiseState");
    expect(JSON.stringify(model.searchResultsPromiseState)).to.equal(
      JSON.stringify({})
    );
    let searchQuery = "pizza";
    let searchType = "main course";
    model.setSearchQuery(searchQuery);
    model.setSearchType(searchType);
    model.doSearch(model.searchParams);

    expect(
      model.searchResultsPromiseState,
      "Does searchResultsPromiseState have a property of promise?"
    ).to.have.property("promise");
    expect(
      model.searchResultsPromiseState.data,
      "Does searchResultsPromiseState's data property initially start null?"
    ).to.be.null;
    expect(
      model.searchResultsPromiseState.error,
      "Does searchResultsPromiseState's error property initially start null?"
    ).to.be.null;
    expect(
      model.searchResultsPromiseState.promise,
      "Does searchResultsPromiseState's promise property initially start null?"
    ).to.not.be.null;
    let start = new Date();
    await model.searchResultsPromiseState.promise;
    let finish = new Date();
    expect(finish - start, "promise should take minimum 2 ms").to.be.above(2);
    expect(
      model.searchResultsPromiseState.data,
      "Did you correctly return the result of the promise and start it into the data property of searchResultsPromiseState?"
    ).to.be.a("array");
    expect(
      model.searchResultsPromiseState.data.length,
      "Did you correctly return ALL of the results of the promise, not just the first item?"
    ).to.not.equal("0");

    model.searchResultsPromiseState.data.forEach((dish) => {
      expect(
        dish,
        "Does the date in searchResultsPromiseState contain an id?"
      ).to.have.property("id");
      expect(
        dish,
        "Does the date in searchResultsPromiseState contain a title?"
      ).to.have.property("title");
      expect(
        dish,
        "Does the date in searchResultsPromiseState contain an image?"
      ).to.have.property("image");
      expect(
        dish.title.toLowerCase(),
        "Is the title of the dish equivalent to the searchQuery given?"
      ).to.contain(searchQuery);
    });
  });

  /*
  it('Model does initiate a new promise when searchParams is empty', async function () {
    expect(model).to.have.property('searchResultsPromiseState');
    expect(JSON.stringify(model.searchResultsPromiseState)).to.equal(
      JSON.stringify({})
    );
    model.doSearch(model.searchParams);
    expect(model.searchResultsPromiseState).to.have.property('promise');
    expect(model.searchResultsPromiseState).to.have.property('data');
    expect(model.searchResultsPromiseState).to.have.property('error');
    expect(model.searchResultsPromiseState.promise).to.not.be.null;
    let start = new Date();
    await model.searchResultsPromiseState.promise;
    let finish = new Date();
    expect(finish - start, 'promise should take minimum 2 ms').to.be.above(2);
    expect(model.searchResultsPromiseState.data).to.be.a('array');
    expect(model.searchResultsPromiseState.data.length).to.not.equal('0');
  });*/
});
