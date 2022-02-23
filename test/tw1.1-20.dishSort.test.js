import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';

describe("TW1.1 sortDishes", function tw1_1_20() {
    this.timeout(200000);  // increase to allow debugging during the test run
    
    it("sorted array should not be the same object as original array. Use e.g. spread syntax [...array]", function tw1_1_20_1(){
        const {sortDishes}= require('../src/'+TEST_PREFIX+'utilities.js');
        
        const array= [dishesConst[4], dishesConst[6], dishesConst[2], dishesConst[7]];
        const arrayCopy=[...array];
        const sorted= sortDishes(array);
        expect(sorted).to.not.equal(array);
        array.forEach(function tw1_1_20_1_checkDishCB(dish, index){
            expect(dish).to.equal(
                arrayCopy[index],
                "do not sort the original array, copy/spread the array, then sort the copy");
        });
    });
    it("sort order should be: 'no type', starter, main course, dessert", function  tw1_1_20_2(){
        const {sortDishes}= require('../src/'+TEST_PREFIX+'utilities.js');
        
        const array= [dishesConst[4], dishesConst[6], dishesConst[2], dishesConst[7]];  
        const sorted= sortDishes(array);
        assert.equal(sorted.length, 4);
        assert.equal(sorted[0], array[3]);
        assert.equal(sorted[1], array[2]);
        assert.equal(sorted[2], array[0]);
        assert.equal(sorted[3], array[1]);
    });
});
