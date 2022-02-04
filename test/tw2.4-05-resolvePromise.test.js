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
    let promiseState = {};

    expect(function () {
      resolvePromise(null, promiseState);
    }, "did you check whether promise is null?"
          ).to.not.throw();
  });

    it('resolvePromise sets data after the promise resolves', async function () {
        let promiseState = {};
        resolvePromise(sleep(10).then(function(){ return 42; }), promiseState);
        expect(promiseState.promise, "promiseState.promise should be set").to.be.ok;
        expect(promiseState.data, "promiseState.data should be null initially").to.be.null;
        expect(promiseState.error, "promiseState.data should be null initially").to.be.null;
        await sleep(11);
        expect(promiseState.promise, "promiseState.promise should be set").to.be.ok;
        expect(promiseState.data, "promiseState.data should be set when the promise resolves").to.equal(42);
        expect(promiseState.error, "promiseState.data should remain null when the promise resolves").to.be.null;
        
    });

    it('resolvePromise sets error after the promise rejects', async function () {
        let promiseState = {};
        resolvePromise(sleep(10).then(function(){ throw 42; }), promiseState);
        expect(promiseState.promise, "promiseState.promise should be set").to.be.ok;
        expect(promiseState.data, "promiseState.data should be null initially").to.be.null;
        expect(promiseState.error, "promiseState.data should be null initially").to.be.null;
        await sleep(11);
        expect(promiseState.promise, "promiseState.promise should be set").to.be.ok;
        expect(promiseState.error, "promiseState.error should be set when the promise rejects").to.equal(42);
        expect(promiseState.data, "promiseState.data should remain null when the promise rejects ").to.be.null;
  });

  it('resolvePromise last promise takes effect', async function () {
    const promiseState = {};

    function makeCallback(ms) {
      function returnDataACB() {
        return 'resolved after ' + ms;
      }

        function laterACB(){
            const promise= Promise.resolve().then(returnDataACB);
            promise.name="promiseToResolveAfter_"+ms;
            resolvePromise(promise, promiseState);
        }
        return laterACB;
    }

      sleep(5).then(makeCallback(20));
      sleep(10).then(makeCallback(10));
      await sleep(30);
      expect(promiseState.promise).to.not.be.null;
      expect(promiseState.promise.name).to.be.equal('promiseToResolveAfter_10', "latest promise should be set in promiseState.promise");
      expect(promiseState.data).to.be.equal('resolved after 10', "latest promise result should be set in promiseState.data");
  });
});
