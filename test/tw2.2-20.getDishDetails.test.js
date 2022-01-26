const { assert, expect } = require("chai");

let dishSource;
const X=TEST_PREFIX;
try {
    dishSource = require("../src/" + X + "dishSource.js").default;
} catch(e) {};

const { getDishDetails } = dishSource;

describe("TW2.2 getDishDetails", function() {
    this.timeout(200000);

    before(function(){
        if(!dishSource) this.skip();
    })

    function testPromise(text, p, expectedDish) {
        it(text, async() => {
            let start = new Date();
            let dish1 = await p();
            let finish = new Date();
            expect(finish-start, "promise getDishDetails should take minimum 2 ms").to.be.above(2);
            expect(dish1.id).to.equal(expectedDish.id);
            expect(dish1.title).to.equal(expectedDish.title);
        }).timeout(2000);
    }

    testPromise("getDishDetails promise #1", ()=>getDishDetails(547775), {
        id: 547775,
        title: "Creamy Avocado Pasta"
    });

    testPromise("getDishDetails promise #2", ()=>getDishDetails(601651), {
        id: 601651,
        title: "Fruit Pizza"
    });


    it("getDishDetails promise must reject if the dish with the given ID does not exist", async() => {
        try {
            const promise = await new Promise((resolve, reject) => getDishDetails(-1).then(reject, resolve))
            expect(promise).to.not.be.null;
        } catch(e) {
            assert.fail("the promise did not reject");
        }
    }).timeout(2000);
})