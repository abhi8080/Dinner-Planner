import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';

let utilities;
try {
utilities= require('../src/'+TEST_PREFIX+'utilities.js');
}
catch (e) {console.log(e);}

describe("TW1.1 menuPrice", function tw1_1_45() {
    this.timeout(200000);  // increase to allow debugging during the test run
    
    it("should sum up dish prices", function tw1_1_45_1(){
        const {menuPrice}= utilities;
        const dishes=[dishesConst[4], dishesConst[6], dishesConst[2], dishesConst[7]];

        assert.equal(menuPrice(dishes),  dishesConst[4].pricePerServing
                            + dishesConst[6].pricePerServing
                            + dishesConst[2].pricePerServing
                            + dishesConst[7].pricePerServing
                           , "sum of all dishes' pricePerServing should be returned");
    });

    it("for empty menu, should return the second reduce() parameter", function tw1_1_45_2(){
        const {menuPrice}= utilities;
        const dishes=[];
        
        expect(menuPrice(dishes),  "reduce requires a second paramater").to.equal(0);
    });
});
