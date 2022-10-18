const { assert, expect } = require("chai");

let getDishDetails;
const X = TEST_PREFIX;
try {
  const dishSource = require("../src/" + X + "dishSource.js");
  if (dishSource.getDishDetails) getDishDetails = dishSource.getDishDetails;
  else getDishDetails = dishSource.default.getDishDetails;
} catch (e) { }

describe("TW2.2 getDishDetails", function tw2_2_10() {
  this.timeout(200000);

  before(function  tw2_2_10_before() {
    if (!getDishDetails) this.skip();
  });

  function testPromise(text, p, expectedDish) {
      it(text, async function tw2_2_10_testPromise(){
      let start = new Date();
      let dish1 = await p();
      let finish = new Date();
      expect(
        finish - start,
        "promise getDishDetails should take minimum 2 ms"
      ).to.be.above(2);
      expect(
        dish1.id,
        "Dish id" + dish1.id + "not equal to expected dish id" + expectedDish.id
      ).to.equal(expectedDish.id);
      expect(
        dish1.title,
        "Dish title" +
          dish1.title +
          "not equal to expected dish title" +
          expectedDish.title
      ).to.equal(expectedDish.title);
    }).timeout(4000);
  }

    testPromise("getDishDetails promise #1",  function tw2_2_10_testPromise1(){return getDishDetails(547775);}, {
        id: 547775,
        title: "Creamy Avocado Pasta",
    });

    testPromise("getDishDetails promise #2", function tw2_2_10_testPromise2(){return  getDishDetails(601651);}, {
        id: 601651,
        title: "Fruit Pizza",
    });

    it("getDishDetails promise must reject if the dish with the given ID does not exist", async function tw2_2_10_3(){
        let error;
        try {
            error= await new Promise(function(resolve, reject){
                return getDishDetails(undefined).then(reject, resolve);
            });
        } catch (e) {
            assert.fail("the promise did not reject");
    }
        expect(error, "getDishDetails(bad_param) must reject with a truthy error").to.be.ok;

  }).timeout(4000);
});
