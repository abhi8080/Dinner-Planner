import { expect } from 'chai';

let resolvePromise;
const X = TEST_PREFIX;
try {
  resolvePromise = require('/src/' + X + 'resolvePromise.js').default;
} catch (e) {}

function sleep(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

describe('TW2.4 resolvePromise', function () {
  this.timeout(200000);

  before(function () {
    if (!resolvePromise) this.skip();
  });

  it('resolvePromise checks for null promise', async function () {
    let promise = null;
    let promiseState = {};

    expect(function () {
      resolvePromise(promise, promiseState);
    }).to.not.throw();
  });

  it('resolvePromise last promise takes effect', async function () {
    const promiseState = {};

    function makeCallback(ms) {
      function returnDataACB() {
        return 'resolved after ' + ms;
      }

      const promise = sleep(2000).then(returnDataACB);
      promise.name = 'promiseToResolveAfter_' + ms;

      resolvePromise(promise, promiseState);
    }

    sleep(1000).then(makeCallback(2000));
    sleep(5000).then(makeCallback(1000));
    sleep(8000).then(makeCallback(3000));
    sleep(10000).then(makeCallback(500));

    expect(promiseState.promise).to.not.be.null;
    expect(promiseState.promise.name).to.be.equal('promiseToResolveAfter_500');
  });
});
