import { expect } from "chai";

var DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

describe("TW3.1 DinnerModel notifies its observers", function() {
  this.timeout(200000);

  let model;
  let observer = false;
  let payload = {};
  this.beforeEach(function() {
    model = new DinnerModel();
    model.addObserver(arg => {observer = !observer, payload=arg})
  })

  function callMethodTwiceWithValueAndTestObserver(method, value, shouldCarryPayload=true) {
    // expect messages
    const obsNotified = `observer not notified in ${method}`;
    const sameArg = `observer notified when ${method} called with same argument twice`;
    const foundPayload = `first argument passed to observer does not contain required payload information`;

    let before = observer;
    payload = {}
    model[method](value);
    expect(before, obsNotified).to.equal(!observer)

    if(shouldCarryPayload) {
      expect(typeof payload, foundPayload).to.equal("object");
      expect(Object.values(payload).indexOf(value) !== -1, foundPayload);
    }

    model[method](value);
    expect(before, sameArg).to.equal(!observer)
  }

  it("model methods correctly call notifyObservers", async function() {

    callMethodTwiceWithValueAndTestObserver("setNumberOfGuests", 99);
    callMethodTwiceWithValueAndTestObserver("addToMenu", 1);
    // dish 1 is now added to menu
    callMethodTwiceWithValueAndTestObserver("removeFromMenu", 1);

    // for setCurrentDish and doSearch we want to temporarily override default fetch
    const oldFetch = window.fetch;
    window.fetch= function(){
        return Promise.resolve({
            ok:true,
            status:200,
            json(){
                return Promise.resolve({});
            }
        });
    };
    try {
      // setCurrentDish
      let timesObserverNotified = 0;
      model.addObserver(() => {timesObserverNotified++;});
      model.setCurrentDish(1);
      expect(timesObserverNotified, "expected initially 2 notifications from setCurrentDish").to.equal(2);
      await model.currentDishPromiseState.promise;
      expect(timesObserverNotified, "expected 3 notifications from setCurrentDish after promise is resolved").to.equal(3);

      timesObserverNotified = 0;
      model.setCurrentDish(1);
      expect(timesObserverNotified, "expected 0 notifications from setCurrentDish when called with same argument twice").to.equal(0);


      // doSearch
      timesObserverNotified = 0;
      model.doSearch()
      expect(timesObserverNotified, "expected initially 1 notifications from setCurrentDish").to.equal(1);
      await model.searchResultsPromiseState.promise;
      expect(timesObserverNotified, "expected 2 notifications from setCurrentDish after promise is resolved").to.equal(2);
    } finally {
      window.fetch = oldFetch;
    }

    // same thing but with fetch that rejects
    window.fetch= function(){
        return Promise.reject("rejected promise test");
    };
    try {
      // setCurrentDish
      let timesObserverNotified = 0;
      model.addObserver(() => {timesObserverNotified++});
      model.setCurrentDish(2);
      expect(timesObserverNotified, "expected initially 2 notifications from setCurrentDish").to.equal(2);
      try {
        await model.currentDishPromiseState.promise;
      } catch(e) {}
      await new Promise(resolve => setTimeout(() => resolve(), 1));
      expect(timesObserverNotified, "expected 3 notifications from setCurrentDish after promise is rejected").to.equal(3);

      // doSearch
      timesObserverNotified = 0;
      model.doSearch();
      expect(timesObserverNotified, "expected initially 1 notifications from setCurrentDish").to.equal(1);
      try {
        await model.searchResultsPromiseState.promise;
      } catch(e) {}
      await new Promise(resolve => setTimeout(() => resolve(), 1));
      expect(timesObserverNotified, "expected 2 notifications from setCurrentDish after promise is rejected").to.equal(2);
    } finally {
      window.fetch = oldFetch;
    }
  });
})