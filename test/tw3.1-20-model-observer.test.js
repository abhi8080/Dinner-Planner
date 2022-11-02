import { expect } from "chai";

describe("TW3.1 DinnerModel notifies its observers", function tw3_1_20() {
  this.timeout(200000);

  let model;
  let observer = false;
  let payload = {};
    
  let fieldName;
  let fieldValue;
  let fieldError;
    
  this.beforeEach(function tw3_1_20_beforeEach() {
      const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;
      model = new DinnerModel();
      model.addObserver(function tw3_1_20_observer(arg){
          observer = !observer;
          if(arg)
              payload=arg;
          fieldError=false;
          try{
              // using eql for deep equality
              expect(model[fieldName]).to.eql(fieldValue);
              // we need to catch because otherwise the error will be swallowed by notifyObservers
          }catch(e){fieldError=true;}
      });
  });

  let methodToPayloadNames = {};

  function checkPayload(method, value, payload) {
      expect(typeof payload, `expected payload in observer notified from ${method}`).to.equal("object");
      expect(Object.keys(payload).length, `only expected one property in payload for ${method}`).to.equal(1);
      methodToPayloadNames[method] = Object.keys(payload)[0];
      expect(payload[methodToPayloadNames[method]], `first argument passed to observer does not contain required payload information for ${method}`).to.equal(value);
  }

 function callMethodTwiceWithValueAndTestObserver(method, field, value, value2=value, expectedValue1=value, expectedValue2=value2) {
    let before = observer;
    payload = {};
    fieldName=field;
    fieldValue= expectedValue1;
    model[method](value);
    expect(before, `observer not notified in ${method}`).to.equal(!observer);
    expect(fieldError, method+ " must change "+  field+"  before it notifies the observers").to.equal(false);
 
    // find out payload property name for this method, and also check that payload value is correct
    checkPayload(method, value, payload);

    fieldValue= expectedValue1;
    model[method](value2);
    expect(before, `observer notified when ${method} called with same argument twice`).to.equal(!observer)
    expect(fieldError, method+ " must change "+  field+"  before it notifies the observers").to.equal(false);
     
    checkPayload(method, value, payload);
  }

  it("model methods correctly call notifyObservers", function tw3_1_20_1() {
      callMethodTwiceWithValueAndTestObserver("setNumberOfGuests", "numberOfGuests", 99);
      
      callMethodTwiceWithValueAndTestObserver("addToMenu", "dishes", {id: 1}, {id: 1}, [{id:1}], [{id:1}, {id:1}]);
      // dish 1 is now added to menu
      callMethodTwiceWithValueAndTestObserver("removeFromMenu", "dishes", {id: 1}, {id: 1}, [], []);
  });

  it("resolvePromise notifies during promise resolution (setCurrentDish, doSearch)", async function tw3_1_20_2() {
    // for setCurrentDish and doSearch we want to temporarily override default fetch
    const oldFetch = window.fetch;
    window.fetch= function(){
        return Promise.resolve({
            ok:true,
            status:200,
            json(){
                return Promise.resolve({results:[]});
            }
        });
    };
    try {
      // setCurrentDish
      let timesObserverNotified = 0;
      let newValue;
      model.addObserver(function tw3_1_20_1_observer1(){
        if(!timesObserverNotified)newValue= model.currentDish;
        timesObserverNotified++;
      });        
      model.setCurrentDish(1);
      expect(newValue, "setCurrentDish should set currentDish before notifying observers").to.equal(1);  
      expect(timesObserverNotified, "expected initially 2 notifications from setCurrentDish").to.equal(2);
        
      checkPayload("setCurrentDish", 1, payload);
      await model.currentDishPromiseState.promise;
      expect(timesObserverNotified, "expected 3 notifications from setCurrentDish after promise is resolved").to.equal(3);

      timesObserverNotified = 0;
      model.setCurrentDish(1);
      expect(timesObserverNotified, "expected 0 notifications from setCurrentDish when called with same argument twice").to.equal(0);


      // doSearch
      timesObserverNotified = 0;
      model.doSearch({});
      expect(timesObserverNotified, "expected 1 notifications from doSearch before the promise is resolved").to.equal(1);
      await model.searchResultsPromiseState.promise;
      expect(timesObserverNotified, "expected 2 notifications from doSearch after promise is resolved").to.equal(2);
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
      let newValue;
      model.addObserver(function tw3_1_20_1_observer2(){
        if(!timesObserverNotified)newValue= model.currentDish;
        timesObserverNotified++;
      });
      model.setCurrentDish(2);
      expect(newValue, "setCurrentDish should set currentDish before notifying observers").to.equal(2);  
      expect(timesObserverNotified, "expected initially 2 notifications from setCurrentDish").to.equal(2);
      try {
        await model.currentDishPromiseState.promise;
      } catch(e) {}
      await new Promise(resolve => setTimeout(resolve));
      expect(timesObserverNotified, "expected 3 notifications from setCurrentDish after promise is rejected").to.equal(3);

      // doSearch
      timesObserverNotified = 0;
      model.doSearch({});
      expect(timesObserverNotified, "expected initially 1 notifications from doSearch").to.equal(1);
      try {
        await model.searchResultsPromiseState.promise;
      } catch(e) {}
      await new Promise(resolve => setTimeout(resolve));
      expect(timesObserverNotified, "expected 2 notifications from doSearch after promise is rejected").to.equal(2);
    } finally {
      window.fetch = oldFetch;
    }
  });

  it("observer payloads have different property names for each method", function tw3_1_20_3() {
    let propertyNames = [];
    Object.keys(methodToPayloadNames).forEach(function tw3_1_20_3_visitMethodCB(method) {
      let propertyName = methodToPayloadNames[method];
      expect(propertyNames.includes(propertyName), "expected unique payload property name").to.equal(false);
      propertyNames.push(propertyName);
    });
  });
});
