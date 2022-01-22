import { assert, expect, should } from 'chai';
const {sortIngredients}= require('../src/'+TEST_PREFIX+'utilities.js');

const ingredientsConst= [
    {aisle:"Produce", name:"pumpkin"},
    {aisle:"Frozen", name:"icecream"},
    {aisle:"Produce", name:"parsley"},
    {aisle:"Frozen", name:"frozen broccoli"},
];

describe("TW1.1 sortIngredients", function() {
    this.timeout(200000);  // increase to allow debugging during the test run
    
    it("sorted array should not be the same object as original array. Use e.g. spread syntax [...array]", function(){
        const ingredients= [...ingredientsConst];
        const sorted= sortIngredients(ingredients);

        assert.equal(sorted.length, ingredients.length);
        expect(sorted).to.not.equal(ingredients);
        ingredients.forEach(function checkIngrCB(i, index){
            expect(i).to.equal(
                ingredientsConst[index],
                "do not sort the original array, copy/spread the array, then sort the copy");
        });
    });
    it("should sort by aisle first, then by name", function(){
        const ingredients= [...ingredientsConst];
        const sorted= sortIngredients(ingredients);
        assert.equal(sorted.length, ingredients.length) ;
        assert.equal(sorted[0], ingredients[3]) ;
        assert.equal(sorted[1], ingredients[1]);
        assert.equal(sorted[2], ingredients[2]);
        assert.equal(sorted[3], ingredients[0]);
    });
});
