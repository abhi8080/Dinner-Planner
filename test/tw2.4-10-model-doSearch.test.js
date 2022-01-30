import { expect } from 'chai';

let DinnerModel;
const X = TEST_PREFIX;
try {
  DinnerModel = require('../src/' + X + 'DinnerModel.js').default;
} catch (e) {}

describe('TW2.4 Search dishes Promise State', function () {
  this.timeout(200000);

  before(function () {
    if (!DinnerModel) this.skip();
  });

  let model;
  this.beforeEach(function () {
    model = new DinnerModel();
  });

  it('Model sets the searchParams for search query and type', function () {
    expect(model).to.have.property('searchParams');
    expect(JSON.stringify(model.searchParams)).to.equal(JSON.stringify({}));
    model.setSearchQuery('pizza');
    model.setSearchType('main course');
    expect(model.searchParams).to.have.property('query');
    expect(model.searchParams).to.have.property('type');
    expect(model.searchParams.query).to.be.a('string');
    expect(model.searchParams.type).to.be.a('string');
    expect(model.searchParams.query).to.be.equal('pizza');
    expect(model.searchParams.type).to.be.equal('main course');
  });

  it('Model doSearch uses with default parameters taken from model.searchParams', async function(){
    expect(model).to.have.property('searchResultsPromiseState');
    expect(JSON.stringify(model.searchResultsPromiseState)).to.equal(
      JSON.stringify({})
    );
    let searchQuery = 'pizza';
    let searchType = 'main course';
    model.setSearchQuery(searchQuery);
    model.setSearchType(searchType);
    model.doSearch();
      
    expect(model.searchResultsPromiseState).to.have.property('promise');
    expect(model.searchResultsPromiseState.data).to.be.null;
    expect(model.searchResultsPromiseState.error).to.be.null;
    expect(model.searchResultsPromiseState.promise).to.not.be.null;
    let start = new Date();
    await model.searchResultsPromiseState.promise;
    let finish = new Date();
    expect(finish - start, 'promise should take minimum 2 ms').to.be.above(2);
    expect(model.searchResultsPromiseState.data).to.be.a('array');
    expect(model.searchResultsPromiseState.data.length).to.not.equal('0');

    model.searchResultsPromiseState.data.forEach((dish) => {
      expect(dish).to.have.property('id');
      expect(dish).to.have.property('title');
      expect(dish).to.have.property('image');
      expect(dish.title.toLowerCase()).to.contain(searchQuery);
    });
  });

    /*
  it('Model does initiate a new promise when searchParams is empty', async function () {
    expect(model).to.have.property('searchResultsPromiseState');
    expect(JSON.stringify(model.searchResultsPromiseState)).to.equal(
      JSON.stringify({})
    );
    model.doSearch();
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
