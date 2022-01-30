import { expect } from 'chai';
import installOwnCreateElement from "./jsxCreateElement";


let promiseNoData;
const X = TEST_PREFIX;
try {
  promiseNoData = require('/src/views/' + X + 'promiseNoData.js').default;
} catch (e) {}

describe('TW2.4 promiseNoData', function () {
  this.timeout(200000);

  before(function () {
    installOwnCreateElement();
    if (!promiseNoData) this.skip();
  });

  it('promiseNoData returns a DIV with "no data" content when promise in the promise state is falsy', async function () {
    const response = promiseNoData({promise:null});

    expect(response.tag).to.be.equal('div');
    expect(response.children.length).to.equal(1);
    expect(response.children[0].toLowerCase()).to.equal("no data");
      
  });

  it('promiseNoData returns an image  when promise is not yet resolved (data and error in promise state are falsy) ', async function () {
    const response = promiseNoData({promise:"dummy"});

    expect(response.tag).to.be.equal('img');
    expect(response.props.src).to.be.a('string');
  });

  it('promiseNoData returns a div with the error text if the error in promise state is truthy', async function () {
    const response = promiseNoData({promise:"dummy", error:"dummy error to show"});

    expect(response.tag).to.equal('div');
    expect(response.children.length).to.equal(1);
    expect(response.children[0]).to.equal('dummy error to show');
  });

  it('promiseNoData returns falsy when data in promise state is not undefined and promise is truthy', async function () {
    const response = promiseNoData({promise: "dummy", data: "some data"});
    expect(response).to.be.not.ok;
  });
});
