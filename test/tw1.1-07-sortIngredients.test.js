import { assert, expect, should } from 'chai';

const ingredientsConst= [
    {aisle:"Produce", name:"pumpkin"},
    {aisle:"Frozen", name:"icecream"},
    {aisle:"Produce", name:"parsley"},
    {aisle:"Frozen", name:"frozen broccoli"},
];

let utilities;
try {
utilities= require('../src/'+TEST_PREFIX+'utilities.js');
}
catch (e) {console.log(e);}

describe("TW1.1 sortIngredients", function tw1_1_30() {
    this.timeout(200000);  // increase to allow debugging during the test run
    

    it("compareIngredientsCB compares by aisle, then by name", function tw1_1_30_0(){
        const {compareIngredientsCB}= utilities;

        expect(compareIngredientsCB(ingredientsConst[0], ingredientsConst[1]), "if first aisle is bigger than second aisle, reverse order (return a positive number)").to.be.gt(0);
        expect(compareIngredientsCB(ingredientsConst[1], ingredientsConst[0]), "if first aisle is smaller than second aisle, do not reverse order (return a negative number)").to.be.lt(0);
        expect(compareIngredientsCB(ingredientsConst[0], ingredientsConst[2]), "if aisle is the same and first name is bigger than second name, reverse order (return a positive number)").to.be.gt(0);
        expect(compareIngredientsCB(ingredientsConst[2], ingredientsConst[0]), "if aisle is the same and first name is smaller than second name, do not reverse order (return a negative number)").to.be.lt(0);
        
        expect(compareIngredientsCB({name: 'milk', aisle:'dairy'}, {name: 'milk', aisle:'Dairys'}),  "aisle comparison should be case-sensitive").to.be.gt(0);
        expect(compareIngredientsCB({name: 'Egg', aisle:'mock'},  {name: 'eggs', aisle:'mock'}),  "name comparison shold be case-sensitive").to.be.lt(0);

    });
    
    it("should sort by aisle first, then by name", function  tw1_1_30_2(){
        const {sortIngredients}= utilities;

        // Check that it sorts by aisle first and then by name
        const ingredients= [...ingredientsConst];
        const sorted= sortIngredients(ingredients);
        assert.equal(sorted.length, ingredients.length, "sorted array should have same length as array provided");
        assert.equal(sorted[0], ingredients[3]);
        assert.equal(sorted[1], ingredients[1]);
        assert.equal(sorted[2], ingredients[2]);
        assert.equal(sorted[3], ingredients[0]);
     });

    it("sorted array should not be the same object as original array. Use e.g. spread syntax [...array]", function  tw1_1_30_1(){
        const {sortIngredients}= utilities;
        const ingredients= [...ingredientsConst];
        const sorted= sortIngredients(ingredients);

        assert.equal(sorted.length, ingredients.length);
        expect(sorted, "sorted array should create a copy").to.not.equal(ingredients);
        ingredients.forEach(function  tw1_1_30_1_checkIngrCB(i, index){
            expect(i).to.equal(
                ingredientsConst[index],
                "do not sort the original array, copy/spread the array, then sort the copy");
        });
    });


});
