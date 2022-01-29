import { expect } from "chai";

let DinnerModel;
const X = TEST_PREFIX;
// DinnerModel should always be there, but making sure doesn't hurt
try {
  DinnerModel = require("../src/" + X + "DinnerModel.js").default;
} catch(e) {};

describe("TW2.4 Current dish Promise State", function() {
  this.timeout(200000);

  before(function(){
    if(!DinnerModel) this.skip();
  });

  let model;
  this.beforeEach(function() {
    model = new DinnerModel();
  });

  it("Model sets currentDishPromiseState on valid dish id", async function() {
    expect(model).to.have.property("currentDishPromiseState");
    let dishId = 601651;
    let dishName = "Fruit Pizza";
    model.setCurrentDish(dishId);
    expect(model.currentDishPromiseState).to.have.property("promise");
    expect(model.currentDishPromiseState).to.have.property("data");
    expect(model.currentDishPromiseState).to.have.property("error");
    expect(model.currentDishPromiseState.promise).to.not.be.null;
    let start = new Date();
    await model.currentDishPromiseState.promise;
    let finish = new Date();
    expect(finish-start, "promise should take minimum 2 ms").to.be.above(2);
    expect(model.currentDishPromiseState.data).to.have.property("id");
    expect(model.currentDishPromiseState.data).to.have.property("title");
    expect(model.currentDishPromiseState.data.id).to.equal(dishId);
    expect(model.currentDishPromiseState.data.title).to.equal(dishName);
  });

  it("Model does not initiate new promise when id is undefined", function() {
    model.setCurrentDish(undefined);
    expect(model).to.have.property("currentDishPromiseState");
    expect(JSON.stringify(model.currentDishPromiseState)).to.equal(JSON.stringify({}));
  });

  it("Model does not initiate new promise when id is not changed", function() {
    let dishId = 601651;
    model.currentDish = dishId;
    model.setCurrentDish(dishId);
    expect(model).to.have.property("currentDishPromiseState");
    expect(JSON.stringify(model.currentDishPromiseState)).to.equal(JSON.stringify({}));
  });
});
