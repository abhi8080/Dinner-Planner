import { expect } from "chai";

describe("TW3.1 DinnerModel as Observable", function tw3_1_10() {
  this.timeout(200000);

    let model;
    this.beforeEach(function tw3_1_10_before(){
        const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;     
        model = new DinnerModel();
    });
  it("observers array is initialized correctly", function tw3_1_10_1() {
      const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;
      try {
          new DinnerModel();
    } catch(e) {
      expect(false, "DinnerModel constructor throws an error. Double check that observer is initialized correctly.").to.equal(true);
    }
    model = new DinnerModel();
    expect(model.observers, "expected model.observers property to be initialized immediately").to.be.ok;
    expect(model.observers, "expect model.observers to be array").to.be.an("array");
  });

  it("can add observers to model which are invoked at notifyObservers", function tw3_1_10_2() {
    let invoked1 = false;
    let invoked2 = false;
    let obs1 = () => invoked1=true;
    let obs2 = () => invoked2=true;
    model.addObserver(obs1);
    expect(
      model.observers.includes(obs1),
      "observer was not added to model.observers when calling addObserver"
    ).to.equal(true);

    model.addObserver(obs2);
    expect(
      model.observers.includes(obs2),
      "observer was not added to model.observers when calling addObserver"
    ).to.equal(true);

    expect(
      invoked1, 
      "did not expect observer to be invoked before calling notifyObservers"
    ).to.equal(false);
    expect(
      invoked2, 
      "did not expect observer to be invoked before calling notifyObservers"
    ).to.equal(false);
    model.notifyObservers();
    expect(
      invoked1, 
      "expected observer to be invoked when calling notifyObservers"
    ).to.equal(true);
    expect(
      invoked2, 
      "expected observer to be invoked when calling notifyObservers"
    ).to.equal(true);
  });

  it("can remove observers from model so that they are not invoked at notifyObservers", function tw3_1_10_3() {
    let invoked1 = false;
    let invoked2 = false;
    let obs1 = () => invoked1=true;
    let obs2 = () => invoked2=true;
    model.addObserver(obs1);
    model.addObserver(obs2);
    model.removeObserver(obs1);
    expect(
      model.observers.includes(obs1),
      "observer was not removed from model.observers when calling removeObserver"
    ).to.equal(false);
    model.removeObserver(obs2);
    expect(
      model.observers.includes(obs2),
      "observer was not removed from model.observers when calling removeObserver"
    ).to.equal(false);
    model.notifyObservers();

    expect(
      invoked1, 
      "did not expect observer to be invoked after removing it from model"
    ).to.equal(false);
    expect(
      invoked2, 
      "did not expect observer to be invoked after removing it from model"
    ).to.equal(false);
  });

  it("error in observer does not break notifyObservers", function tw3_1_10_4() {
    let obs = () => {throw new Error("");};
    expect(() => {
      const oldConsoleLog=console.log;
      const oldConsoleError=console.error;
      console.log=console.error=()=>{};
      try{              
        model.addObserver(obs);
        model.notifyObservers();
      }finally{
        console.log=oldConsoleLog;
        console.error=oldConsoleError;
      }
    }, "did not expect error to be thrown").to.not.throw();
  });

  it("error in observer logs in console", function tw3_1_10_5() {
    let obs = () => {throw new Error("");};
    model.addObserver(obs);

    let oldConsole = console;
    let errorLog;

    window.console = {error: msg => errorLog=msg, log: msg => errorLog=msg};
    model.notifyObservers();
    expect(errorLog, "expected error log from error-throwing observer").to.be.ok;
    console = oldConsole;
    model.removeObserver(obs);

    oldConsole = console;
    model.addObserver(() => {});
    errorLog = undefined;
    window.console = {error: msg => errorLog=msg, log: msg => errorLog=msg};
    model.notifyObservers();
    console = oldConsole;
    expect(errorLog, "did not expect log from non-erroneous observer").to.be.undefined;
  });
});
