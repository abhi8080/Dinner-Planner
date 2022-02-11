import { expect } from "chai";

var DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

describe("TW3.1 DinnerModel as Observable", function() {
  this.timeout(200000);

  let model;
  beforeEach(function() {
    model = new DinnerModel();
  });

  it("can add observers to model which are invoked at notifyObservers", function() {
    let invoked1 = false;
    let invoked2 = false;
    model.addObserver(() => invoked1=true);
    model.addObserver(() => invoked2=true);
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

  it("can remove observers from model so that they are not invoked at notifyObservers", function() {
    let invoked1 = false;
    let invoked2 = false;
    let obs1 = () => invoked1=true;
    let obs2 = () => invoked2=true;
    model.addObserver(obs1);
    model.addObserver(obs2);
    model.removeObserver(obs1);
    model.removeObserver(obs2);
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

  it("error in observer does not break notifyObservers", function() {
    let obs = () => {throw new Error("")};
    model.addObserver(obs);
    expect(() => model.notifyObservers(), "did not expect error to be thrown").to.not.throw();
  });

  it("error in observer logs in console", function() {
    let obs = () => {throw new Error("")};
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
    expect(errorLog, "did not expect error log from ok observer").to.be.undefined;
  });
});