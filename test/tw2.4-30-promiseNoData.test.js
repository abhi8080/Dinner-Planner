import { expect } from 'chai';

let promiseNoData;
const X = TEST_PREFIX;
try {
  promiseNoData = require('/src/views/' + X + 'promiseNoData.js').default;
} catch (e) {}

describe('TW2.4 promiseNoData', function () {
  this.timeout(200000);

  before(function () {
    if (!promiseNoData) this.skip();
  });

  it('promiseNoData returns "no data" when promise is null', async function () {
    const response = promiseNoData(null);

    expect(response.type).to.be.equal('div');
    expect(response.children).to.be.equal('no data');
  });

  it('promiseNoData returns loader when promise is not resolved yet', async function () {
    const promiseState = {};
    promiseState.promise = 'dummyPromise';

    const response = promiseNoData(promiseState);

    expect(response.type).to.be.equal('img');
    expect(response.props.src).to.be.a('string');
    expect(response.props.src).to.be.equal(
      'http://www.csc.kth.se/~cristi/loading.gif'
    );
  });

  it('promiseNoData returns error when promise is rejected or fails', async function () {
    const promiseState = {};
    promiseState.promise = 'dummyPromise';
    promiseState.error = 'dummy error to show';

    const response = promiseNoData(promiseState);

    expect(response.type).to.be.equal('div');
    expect(response.children).to.be.equal('dummy error to show');
  });

  it('promiseNoData returns false when promise is resolved and data is not null', async function () {
    const promiseState = {};
    promiseState.promise = 'dummyPromise';
    promiseState.data = 'dummy data';

    const response = promiseNoData(promiseState);

    expect(response).to.be.a('boolean');
    expect(response).to.be.equal(false);
  });
});
