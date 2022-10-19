import { expect } from "chai";
import {withMyFetch, myDetailsFetch} from "./mockFetch.js";

const X = TEST_PREFIX;

describe("TW2.4 Current dish Promise State", function tw_2_4_20() {
  this.timeout(200000);

  let model;
  this.beforeEach(function tw_2_4_20_beforeEach() {
      const DinnerModel = require("../src/" + X + "DinnerModel.js").default;
      model = new DinnerModel();
  });
  it("Model initializes currentDishPromiseState correctly", function tw_2_4_20_1() {
    expect(
      model,
      "model must have currentDishPromiseState property"
    ).to.have.property("currentDishPromiseState");
    expect(JSON.stringify(model.currentDishPromiseState)).to.equal(
      JSON.stringify({})
    );
  });

  it("Model sets currentDishPromiseState on valid dish id", async function tw_2_4_20_2() {
    expect(model).to.have.property("currentDishPromiseState");
    let dishId = 601651;
    withMyFetch(myDetailsFetch, ()=>model.setCurrentDish(dishId));
    expect(
      model.currentDishPromiseState,
      "currentDishPromiseState must have a property called promise"
    ).to.have.property("promise");
    expect(
      model.currentDishPromiseState.data,
      "currentDishPromiseState must have a property called data which is initially null"
    ).to.be.null;
    expect(
      model.currentDishPromiseState.error,
      "currentDishPromiseState must have a property called error which is initially null"
    ).to.be.null;
    expect(
      model.currentDishPromiseState.promise,
      "currentDishPromiseState must have a property called promise which is initially null"
    ).to.not.be.null;
    await model.currentDishPromiseState.promise;
    expect(
      model.currentDishPromiseState.data,
      "current data in currentDishPromiseState must have the property of id after a promise result"
    ).to.have.property("id");
    expect(
      model.currentDishPromiseState.data.id,
      "current data in currentDishPromiseState must have the correct dish id of: " +
        dishId
    ).to.equal(dishId);
  });

  it("Model does not initiate new promise when id is undefined", function tw_2_4_20_3() {
    model.setCurrentDish(undefined);
    expect(model).to.have.property("currentDishPromiseState");
    expect(
      JSON.stringify(model.currentDishPromiseState),
      "What should be done when you receive an undefined id in setCurrentDish?"
    ).to.equal(JSON.stringify({}));
  });

  it("Model does not initiate new promise when id is not changed", function tw_2_4_20_4() {
    let dishId = 601651;
    model.currentDish = dishId;
    model.setCurrentDish(dishId);
    expect(model).to.have.property("currentDishPromiseState");
    expect(
      JSON.stringify(model.currentDishPromiseState),
      "What should be done when you receive an id that is the same as the currentDishId in setCurrentDish?"
    ).to.equal(JSON.stringify({}));
  });
});
