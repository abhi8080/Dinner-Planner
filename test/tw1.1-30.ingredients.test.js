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

        // Check if ingredient names have been manipulated, likely with toLowerCase or toUpperCase.
        // if "egg" comes before "Eggs" after sorting by name, then it is likely that toLowerCase/toUpperCase has been used.
        const mockIngredient1= {name: 'egg', aisle:'mock'}
        const mockIngredient2= {name: 'Eggs', aisle:'mock'}
        const mockSorted= sortIngredients([{...mockIngredient1}, {...mockIngredient2}]);
        expect(mockSorted.map(e => e.name)).to.have.ordered.members([mockIngredient2.name, mockIngredient1.name], "sort by name shold be case-sensitive");

        // Check if aisles have been manipulated, likely with toLowerCase or toUpperCase.
        // if "dairy" comes before "Dairys" after sorting by aisle, then it is likely that toLowerCase/toUpperCase has been used.
        const mockIngredient3= {name: 'milk', aisle:'dairy'}
        const mockIngredient4= {name: 'milk', aisle:'Dairys'}
        const mockSorted2= sortIngredients([{...mockIngredient3}, {...mockIngredient4}]);
        expect(mockSorted2.map(e => e.aisle)).to.have.ordered.members([mockIngredient4.aisle, mockIngredient3.aisle], "sort by aisle should be case-sensitive");
    });
});
