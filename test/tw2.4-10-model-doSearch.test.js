import { expect } from "chai";
import {withMyFetch, mySearchFetch} from "./mockFetch.js";


const X = TEST_PREFIX;

describe("TW2.4 Search dishes Promise State", function tw2_4_10() {
  this.timeout(200000);

  let model;
  this.beforeEach(function tw2_4_10_beforeEach() {
      const DinnerModel = require("../src/" + X + "DinnerModel.js").default;
      model = new DinnerModel();
  });

  it("Model sets the searchParams for search query and type", function tw2_4_10_1() {
    expect(
      model,
      "searchParams must be added to the model"
    ).to.have.property("searchParams");
      expect(JSON.stringify(model.searchParams), "paramter expeted to be empty").to.equal(JSON.stringify({}));
    model.setSearchQuery("pizza");
    model.setSearchType("main course");
    expect(
      model.searchParams,
      "searchParams must have the property query"
    ).to.have.property("query");
    expect(
      model.searchParams,
      "searchParams must have the property type"
    ).to.have.property("type");
    expect(
      model.searchParams.query,
      "searchParams must have the property query and it must be a string"
    ).to.be.a("string");
    expect(
      model.searchParams.type,
      "searchParams must have the property type and it must be a string"
    ).to.be.a("string");
    expect(
      model.searchParams.query,
      "searchParams query must be set to 'pizza' when setSearchQuery('pizza') is called"
    ).to.be.equal("pizza");
    expect(
      model.searchParams.type,
      "searchParams type must be set to 'main course' when setSearchType('main course') is called"
    ).to.be.equal("main course");
  });

  it("Model doSearch uses default parameters taken from model.searchParams", async function tw2_4_10_2() {
    expect(
      model,
      "Model must have a searchResultsPromiseState"
    ).to.have.property("searchResultsPromiseState");
    expect(JSON.stringify(model.searchResultsPromiseState)).to.equal(
      JSON.stringify({})
    );
    let searchQuery = "pizza";
    let searchType = "main course";
    model.setSearchQuery(searchQuery);
    model.setSearchType(searchType);
    withMyFetch(mySearchFetch, ()=>model.doSearch(model.searchParams)); 

    expect(
      model.searchResultsPromiseState,
      "searchResultsPromiseState must have the property promise"
    ).to.have.property("promise");
    expect(
      model.searchResultsPromiseState.data,
      "searchResultsPromiseState data property must start as null"
    ).to.be.null;
    expect(
      model.searchResultsPromiseState.error,
      "searchResultsPromiseState's error property initially starts null"
    ).to.be.null;
    expect(
      model.searchResultsPromiseState.promise,
      "searchResultsPromiseState's promise property initially starts null"
    ).to.not.be.null;
    await model.searchResultsPromiseState.promise;
    expect(
      model.searchResultsPromiseState.data,
      "Must return result of promise and store it in the data property"
    ).to.be.a("array");
    expect(
      model.searchResultsPromiseState.data.length,
      "All of the results must be returned, not just the first item"
    ).to.not.equal("0");

    model.searchResultsPromiseState.data.forEach(function tw2_4_10_2_checkDishCB(dish){
      expect(
        dish,
        "searchResultsPromiseState data must contains an id"
      ).to.have.property("id");
      expect(
        dish,
        "searchResultsPromiseState data must contains a title"
      ).to.have.property("title");
      expect(
        dish,
        "searchResultsPromiseState data contains an image"
      ).to.have.property("image");
      expect(
        dish.title.toLowerCase(),
        "The title of the dish must be equal to the searchQuery given"
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
