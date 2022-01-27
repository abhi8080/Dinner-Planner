const { assert, expect } = require("chai");

let searchDishes;
const X=TEST_PREFIX;
try {
    const dishSource = require("../src/" + X + "dishSource.js");
    if(dishSource.searchDishes)
        searchDishes= dishSource.searchDishes;
    else
        searchDishes= dishSource.default.searchDishes;
} catch(e) {};


describe("TW2.2 searchDishes", function() {
    this.timeout(200000);

    before(function(){
        if(!searchDishes) this.skip();
    });

    function testPromise(text, p, expectedResult) {
        it(text, async() => {
            let start = new Date();
            let dishes = await p();
            let finish = new Date();
            expect(finish-start, "promise searchDishes should take minimum 2 ms").to.be.above(2);
            expect(JSON.stringify(dishes)).to.equal(JSON.stringify(expectedResult));
        }).timeout(4000);
    }

    testPromise("searchDishes promise #1", ()=>searchDishes({query: "pizza", type: "main course"}),[
        {
            "id":587203,
            "title":"Taco Pizza",
            "readyInMinutes":20,
            "servings":6,
            "sourceUrl":"https://laurenslatest.com/taco-salad-pizza-with-doritos/",
            "openLicense":0,
            "image":"Taco-Salad-Pizza-with-Doritos-587203.jpg"
        },
        {
            "id":559251,
            "title":"Breakfast Pizza",
            "readyInMinutes":25,
            "servings":6,
            "sourceUrl":"http://www.jocooks.com/breakfast-2/breakfast-pizza/",
            "openLicense":0,
            "image":"Breakfast-Pizza-559251.jpg"
        },
        {
            "id":556121,
            "title":"Easy Vegetarian Sausage Basil Pizza",
            "readyInMinutes":30,
            "servings":4,
            "sourceUrl":"https://dizzybusyandhungry.com/cashew-sausage-basil-pizza/",
            "openLicense":0,
            "image":"Cashew-Sausage-Basil-Pizza-556121.png"
        },
        {
            "id":225711,
            "title":"Tuna, olive & rocket pizzas",
            "readyInMinutes":27,
            "servings":2,
            "sourceUrl":"https://www.bbcgoodfood.com/recipes/2940669/tuna-olive-and-rocket-pizzas",
            "openLicense":0,
            "image":"Tuna--olive---rocket-pizzas-225711.jpg"
        },
        {
            "id":209875,
            "title":"Very simple Margherita pizza",
            "readyInMinutes":35,
            "servings":2,
            "sourceUrl":"https://www.bbcgoodfood.com/recipes/2037645/very-simple-margherita-pizza",
            "openLicense":0,
            "image":"Very-simple-Margherita-pizza-209875.jpg"
        },
        {
            "id":210242,
            "title":"Cheese & bacon scone pizza",
            "readyInMinutes":30,
            "servings":4,
            "sourceUrl":"https://www.bbcgoodfood.com/recipes/8782/cheese-and-bacon-scone-pizza",
            "openLicense":0,
            "image":"Cheese---bacon-scone-pizza-210242.jpg"
        },
        {
            "id":210979,
            "title":"Sloppy Joe pizza breads",
            "readyInMinutes":30,
            "servings":4,
            "sourceUrl":"https://www.bbcgoodfood.com/recipes/2320643/sloppy-joe-pizza-breads",
            "openLicense":0,
            "image":"Sloppy-Joe-pizza-breads-210979.jpg"
        },
        {
            "id":218331,
            "title":"Mozzarella, ham & pesto pizzas",
            "readyInMinutes":10,
            "servings":2,
            "sourceUrl":"https://www.bbcgoodfood.com/recipes/2970/mozzarella-ham-and-pesto-pizzas",
            "openLicense":0,
            "image":"Mozzarella--ham---pesto-pizzas-218331.jpg"
        },
        {
            "id":763896,
            "title":"Quick & Easy Mexican Pizzas",
            "readyInMinutes":30,
            "servings":4,
            "sourceUrl":"https://lifemadesimplebakes.com/2016/05/quick-easy-mexican-pizzas/",
            "openLicense":0,
            "image":"quick-easy-mexican-pizzas-763896.jpg"
        },
        {
            "id":511787,
            "title":"Cheeseburger Pizza",
            "readyInMinutes":33,
            "servings":4,
            "sourceUrl":"https://foxeslovelemons.com/cheeseburger-pizza/",
            "openLicense":0,
            "image":"Cheeseburger-Pizza-511787.jpg"
        }
    ]);
})
