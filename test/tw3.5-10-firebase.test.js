import { assert, expect } from "chai";

const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

let firebaseModel;

let firebaseData;

const firebaseEvents={
    value:{},
    child_added:{},
    child_removed:{},
};

let firebaseRoot;
let firebaseDataForOnce;
window.firebase={
    initializeApp(){},
    database(){
        return {
            ref(x){
                return {
                    set(value){firebaseData[x]= value;},
                    on(event,f){firebaseEvents[event][x]= f;},
                    once(event,f){
                        firebaseRoot=x;
                        expect(firebaseDataForOnce, "once is only supposed to be used for the initial promise").to.be.ok;
                        return Promise.resolve({
                            key:x,
                            val(){ return firebaseDataForOnce;}
                        });
                    },
                };
            }
        };
    }
};

let lastFetch;

function myFetch(fetchURL){
    lastFetch=fetchURL;
    return Promise.resolve({
        ok:true,
        json(){
            const matches=(""+fetchURL).match(/\d+/g);
            if(!matches || matches.length==0){
                throw "could not find numbers in " +fetchURL;
            }
            return Promise.resolve({id: +matches[matches.length-1]});
        }
    });
}
async function withMyFetch(f){
    const oldFetch= fetch;
    window.fetch= myFetch;
    try{
        f();
    }
    catch(e){
        console.error(e);
    }
    finally{ window.fetch=oldFetch; }
    await new Promise(resolve => setTimeout(resolve));  // need to wait a bit for the "fetch"
}

async function findKeys(){
    firebaseData={};
    const model= new DinnerModel();
    firebaseModel.updateFirebaseFromModel(model);
    model.setNumberOfGuests(3);
    const numberKey= Object.keys(firebaseData)[0];
    
    firebaseData={};
    await withMyFetch(function(){ model.setCurrentDish(8);});
    const currentDishKey= Object.keys(firebaseData)[0];
    
    firebaseData={};
    model.addToMenu(dishInformation);
    const dishesKey= Object.keys(firebaseData)[0].replace("/1445969", "");
    return {numberKey, currentDishKey, dishesKey};
}
const X = TEST_PREFIX;
try {
  firebaseModel = require("../src/" + X + "firebaseModel.js");
} catch (e) {console.log(e);}

describe("TW3.5 Firebase-model", function () {
    this.timeout(200000); // increase to allow debugging during the test run
    
    before(function () {
        if (!firebaseModel) this.skip();
    });
    it("model saved to firebase", async function () {
        firebaseData={};
        const model= new DinnerModel();
        
        firebaseModel.updateFirebaseFromModel(model);

        expect(firebaseData, "no data should be set in firebase by updateFirebaseFromModel").to.be.empty;

        model.setNumberOfGuests(5);
        let data= Object.values(firebaseData);
        expect(data.length, "setting number of guests should set a single firebase property").to.equal(1);
        expect(data[0], "number of guests saved correctly").to.equal(5);
        const numberKey=Object.keys(firebaseData)[0];

        firebaseData={};
        model.setNumberOfGuests(5);
        expect(firebaseData, "no data should be set in firebase if number of guests is set to its existing value ").to.be.empty;

        firebaseData={};        
        await withMyFetch(function(){ model.setCurrentDish(7);});
        
        data= Object.values(firebaseData);
        expect(data.length, "setting current dish should set a single firebase property").to.equal(1);
        expect(data[0], "current dish id saved correctly").to.equal(7);
        const currentDishKey=Object.keys(firebaseData)[0];
        expect(currentDishKey, "firebase paths for number of guests and current dish must be different").to.not.equal(numberKey); 
        
        firebaseData={};
        lastFetch=undefined;
        await withMyFetch(function(){ model.setCurrentDish(7);});

        expect(lastFetch, "no fetch expected if currentDish is set to its existing value").to.not.be.ok;
        expect(firebaseData, "no data should be set in firebase if currentDish is set to its existing value ").to.be.empty;
        
        firebaseData={};
        model.addToMenu(dishInformation);
        data= Object.keys(firebaseData);
        expect(data.length, "adding a dish should set a single firebase property").to.equal(1);
        let numbers= data[0].match(/\d+$/);
        expect(numbers[numbers.length-1], "the firebase path for an added dish must end with the dish id as string").to.equal("1445969");
        expect(data[0].endsWith(numbers[numbers.length-1]), "the firebase path for an added dish must end with the dish id as string").to.be.true;
        expect(Object.values(firebaseData)[0], "the object saved in firebase for an added dish must be truthy").to.be.ok;

        firebaseData={};
        model.addToMenu(dishInformation);
        expect(firebaseData, "adding a dish that is already in the menu should not change firebase").to.be.empty;

        firebaseData={};
        model.removeFromMenu(dishInformation);
        data= Object.keys(firebaseData);
        expect(data.length, "removing a dish should set a single firebase property").to.equal(1);
        numbers= data[0].match(/\d+$/);
        expect(numbers[numbers.length-1], "the firebase path for a removed dish must end with the dish id as string").to.equal("1445969");
        expect(data[0].endsWith(numbers[numbers.length-1]), "the firebase path for a removed dish must end with the dish id as string").to.be.true;
        expect(Object.values(firebaseData)[0], "removing a dish should remove an object from firebase by setting null on its path").to.not.be.ok;
        firebaseData={};
        model.removeFromMenu(dishInformation);
        expect(firebaseData, "removing a dish that is not in the menu should not change firebase").to.be.empty;
    });
    it("model read from firebase", async function () {
        const {numberKey, dishesKey, currentDishKey}= await findKeys();

        let nguests, currentDish, dishAdded, dishRemoved;
        const mockModel={
            dishes:[],
            setNumberOfGuests(x){ nguests=x;} ,
            setCurrentDish(x){ currentDish=x;} ,
            addToMenu(x){ dishAdded=x;} ,
            removeFromMenu(x){ dishRemoved=x;} ,
        };
        
        firebaseModel.updateModelFromFirebase(mockModel);
        
        expect(Object.keys(firebaseEvents.value).length, "two value listeners are needed: number of guests and current dish").to.equal(2);
        expect(firebaseEvents.value[numberKey], "there should be an on() value listener for the number of guests").to.be.ok;
        expect(firebaseEvents.value[currentDishKey], "there should be an on() value listener for the current dish").to.be.ok;
        expect(Object.keys(firebaseEvents.child_added).length, "one child_added listener is needed").to.equal(1);
        expect(firebaseEvents.child_added[dishesKey], "there should be an on() child added listener for the dishes").to.be.ok;
        expect(Object.keys(firebaseEvents.child_removed).length, "one child_removed listener is needed").to.equal(1);
        expect(firebaseEvents.child_removed[dishesKey], "there should be an on() child removed listener for the dishes").to.be.ok;

        firebaseEvents.value[numberKey]({val(){ return 7;}});
        expect(nguests, "callback passed to on() value listener for number of guests should change the number of guests").to.equal(7);

        firebaseEvents.value[currentDishKey]({val(){ return 8;}});
        expect(currentDish, "callback passed to on() value listener for current dish should change the current dish").to.equal(8);
        
        lastFetch=undefined;
        await withMyFetch(function(){firebaseEvents.child_added[dishesKey]({key:"3214", val(){ return "blabla";}});});

        expect(lastFetch, "a child added event should initiate a promise to retrieve the dish").to.be.ok;
        expect(dishAdded, "a child added event should add a dish if it does not exist already").to.be.ok;
        expect(dishAdded.id, "a child added event should add a dish with the given key it does not exist already").to.equal(3214);

        mockModel.dishes=[dishAdded];
        dishAdded=undefined;
        lastFetch=undefined;
        await withMyFetch(function(){firebaseEvents.child_added[dishesKey]({key:"3214", val(){ return "blabla";}});});

        expect(lastFetch, "a child added event should not initiate a promise if the dish is already in the menu").to.not.be.ok;
        expect(dishAdded, "a child added event should not add a dish if it is already in the menu").to.not.be.ok;

        firebaseEvents.child_removed[dishesKey]({key:"3214", val(){ return "blabla";}});
        expect(dishRemoved, "a child removed event should remove the dish from the menu").to.be.ok;
    });

    it("model firebase promise", async function () {
        const {numberKey, dishesKey, currentDishKey}= await findKeys();
        const root= longestCommonPrefix([numberKey, dishesKey, currentDishKey]);
        const num= numberKey.slice(root.length);
        const dishes= dishesKey.slice(root.length);
        const currentDish= currentDishKey.slice(root.length);
        
        console.log(root, num, dishes);
        firebaseDataForOnce={
            [num]:7,
            [dishes]:{
                "12":"bla",
                "15":"blabla",
                "14":"some dish"
            },
            [currentDish]:42,
        };
        const oldFetch= fetch;
        window.fetch= myFetch;
        let model;
        try{
            model= await firebaseModel.firebaseModelPromise();
        }
        finally{ window.fetch=oldFetch; }
        expect(model, "promise should resolve to a model").to.be.ok;
        expect(model.constructor.name, "promise should resolve to a model").to.equal("DinnerModel");
        expect(firebaseRoot, "once should be attached on the firebase model root").to.equal(root.slice(0,-1));
        expect(model.numberOfGuests, "initial model should read number of guests from firebase").to.equal(7);
        expect(model.dishes, "initial model should read dishes from firebase").to.be.ok;
        expect(model.dishes.length, "initial model should read from firebase the same number of dishes").to.equal(3);
        expect(model.dishes.map(d=>d.id).sort().join(","), "initial model should read from firebase the same dishes").to.equal("12,14,15");
        expect(model.currentDish, "initial model should not include current dish").to.not.be.ok;
    });
});

function longestCommonPrefix(strs) {
    if (strs === undefined || strs.length === 0) { return ''; }
    
    return strs.reduce((prev, next) => {
        let i = 0;
        while (prev[i] && next[i] && prev[i] === next[i]) i++;
        return prev.slice(0, i);
    });
};

const dishInformation = {
  "vegetarian": true,
  "vegan": true,
  "glutenFree": true,
  "dairyFree": true,
  "veryHealthy": true,
  "cheap": false,
  "veryPopular": false,
  "sustainable": false,
  "weightWatcherSmartPoints": 2,
  "gaps": "no",
  "lowFodmap": false,
  "preparationMinutes": 5,
  "cookingMinutes": 10,
  "aggregateLikes": 0,
  "spoonacularScore": 94.0,
  "healthScore": 100.0,
  "creditsText": "Food Faith Fitness",
  "sourceName": "Food Faith Fitness",
  "pricePerServing": 365.61,
  "extendedIngredients": [
    {
      "id": 11011,
      "aisle": "Produce",
      "image": "asparagus.png",
      "consistency": "solid",
      "name": "asparagus",
      "nameClean": "asparagus",
      "original": "1 3/4 Lb Asparagus (2 small bunches)",
      "originalString": "1 3/4 Lb Asparagus (2 small bunches)",
      "originalName": "Asparagus (2 small bunches)",
      "amount": 1.75,
      "unit": "Lb",
      "meta": [
        "(2 small bunches)"
      ],
      "metaInformation": [
        "(2 small bunches)"
      ],
      "measures": {
        "us": {
          "amount": 1.75,
          "unitShort": "Lb",
          "unitLong": "Lbs"
        },
        "metric": {
          "amount": 1.75,
          "unitShort": "Lb",
          "unitLong": "Lbs"
        }
      }
    },
    {
      "id": 4053,
      "aisle": "Oil, Vinegar, Salad Dressing",
      "image": "olive-oil.jpg",
      "consistency": "liquid",
      "name": "olive oil",
      "nameClean": "olive oil",
      "original": "1/2 Tbsp Olive oil",
      "originalString": "1/2 Tbsp Olive oil",
      "originalName": "Olive oil",
      "amount": 0.5,
      "unit": "Tbsp",
      "meta": [],
      "metaInformation": [],
      "measures": {
        "us": {
          "amount": 0.5,
          "unitShort": "Tbsps",
          "unitLong": "Tbsps"
        },
        "metric": {
          "amount": 0.5,
          "unitShort": "Tbsps",
          "unitLong": "Tbsps"
        }
      }
    },
    {
      "id": 11215,
      "aisle": "Produce",
      "image": "garlic.png",
      "consistency": "solid",
      "name": "garlic",
      "nameClean": "garlic",
      "original": "1/2 tsp Fresh garlic, minced",
      "originalString": "1/2 tsp Fresh garlic, minced",
      "originalName": "Fresh garlic, minced",
      "amount": 0.5,
      "unit": "tsp",
      "meta": [
        "fresh",
        "minced"
      ],
      "metaInformation": [
        "fresh",
        "minced"
      ],
      "measures": {
        "us": {
          "amount": 0.5,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        },
        "metric": {
          "amount": 0.5,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        }
      }
    },
    {
      "id": 11216,
      "aisle": "Produce;Ethnic Foods;Spices and Seasonings",
      "image": "ginger.png",
      "consistency": "solid",
      "name": "ginger",
      "nameClean": "ginger",
      "original": "1/2 tsp Fresh ginger, minced",
      "originalString": "1/2 tsp Fresh ginger, minced",
      "originalName": "Fresh ginger, minced",
      "amount": 0.5,
      "unit": "tsp",
      "meta": [
        "fresh",
        "minced"
      ],
      "metaInformation": [
        "fresh",
        "minced"
      ],
      "measures": {
        "us": {
          "amount": 0.5,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        },
        "metric": {
          "amount": 0.5,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        }
      }
    },
    {
      "id": 9206,
      "aisle": "Beverages",
      "image": "orange-juice.jpg",
      "consistency": "liquid",
      "name": "orange juice",
      "nameClean": "orange juice",
      "original": "1/4 Cup Orange juice (not from concentrate)",
      "originalString": "1/4 Cup Orange juice (not from concentrate)",
      "originalName": "Orange juice (not from concentrate)",
      "amount": 0.25,
      "unit": "cup",
      "meta": [
        "(not from concentrate)"
      ],
      "metaInformation": [
        "(not from concentrate)"
      ],
      "measures": {
        "us": {
          "amount": 0.25,
          "unitShort": "cups",
          "unitLong": "cups"
        },
        "metric": {
          "amount": 59.147,
          "unitShort": "ml",
          "unitLong": "milliliters"
        }
      }
    },
    {
      "id": 4058,
      "aisle": "Ethnic Foods",
      "image": "sesame-oil.png",
      "consistency": "liquid",
      "name": "sesame oil",
      "nameClean": "sesame oil",
      "original": "1/4 tsp Sesame oil",
      "originalString": "1/4 tsp Sesame oil",
      "originalName": "Sesame oil",
      "amount": 0.25,
      "unit": "tsp",
      "meta": [],
      "metaInformation": [],
      "measures": {
        "us": {
          "amount": 0.25,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        },
        "metric": {
          "amount": 0.25,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        }
      }
    },
    {
      "id": 2047,
      "aisle": "Spices and Seasonings",
      "image": "salt.jpg",
      "consistency": "solid",
      "name": "salt",
      "nameClean": "salt",
      "original": "1/8 tsp Salt",
      "originalString": "1/8 tsp Salt",
      "originalName": "Salt",
      "amount": 0.125,
      "unit": "tsp",
      "meta": [],
      "metaInformation": [],
      "measures": {
        "us": {
          "amount": 0.125,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        },
        "metric": {
          "amount": 0.125,
          "unitShort": "tsps",
          "unitLong": "teaspoons"
        }
      }
    }
  ],
  "id": 1445969,
  "title": "Asparagus Stir Fry",
  "readyInMinutes": 15,
  "servings": 2,
  "sourceUrl": "https://www.foodfaithfitness.com/asparagus-stir-fry/",
  "image": "https://spoonacular.com/recipeImages/1445969-556x370.jpg",
  "imageType": "jpg",
  "summary": "Need a <b>gluten free, dairy free, lacto ovo vegetarian, and vegan hor d'oeuvre</b>? Asparagus Stir Fry could be a tremendous recipe to try. For <b>$3.66 per serving</b>, this recipe <b>covers 27%</b> of your daily requirements of vitamins and minerals. One portion of this dish contains around <b>9g of protein</b>, <b>5g of fat</b>, and a total of <b>131 calories</b>. This recipe serves 2. 1 person were impressed by this recipe. It is brought to you by Food Faith Fitness. From preparation to the plate, this recipe takes approximately <b>15 minutes</b>. A mixture of asparagus, salt, garlic, and a handful of other ingredients are all it takes to make this recipe so scrumptious. With a spoonacular <b>score of 0%</b>, this dish is very bad (but still fixable). If you like this recipe, you might also like recipes such as <a href=\"https://spoonacular.com/recipes/asparagus-stir-fry-115129\">Asparagus Stir-Fry</a>, <a href=\"https://spoonacular.com/recipes/asparagus-stir-fry-405147\">Asparagus Stir-Fry</a>, and <a href=\"https://spoonacular.com/recipes/asparagus-tomato-stir-fry-387505\">Asparagus Tomato Stir-Fry</a>.",
  "cuisines": [],
  "dishTypes": [
    "antipasti",
    "starter",
    "snack",
    "appetizer",
    "antipasto",
    "hor d'oeuvre"
  ],
  "diets": [
    "gluten free",
    "dairy free",
    "lacto ovo vegetarian",
    "vegan"
  ],
  "occasions": [],
  "winePairing": {
    "pairedWines": [],
    "pairingText": "",
    "productMatches": []
  },
  "instructions": "Instructions\n\nBreak the asparagus to get the stalky parts off and thinly slice the asparagus diagonally\n\nHeat the olive oil in a medium pan on medium heat. Add in the asparagus and cook, stirring frequently, for 4-5 minutes until they are fork tender.\n\nAdd in the garlic and ginger and cook 1 minute. Then, add in the orange juice and simmer for 1 minute, or until evaporated.\n\nRemove from the heat and stir in the sesame oil and salt.\n\nDEVOUR!",
  "analyzedInstructions": [
    {
      "name": "",
      "steps": [
        {
          "number": 1,
          "step": "Break the asparagus to get the stalky parts off and thinly slice the asparagus diagonally",
          "ingredients": [
            {
              "id": 11011,
              "name": "asparagus",
              "localizedName": "asparagus",
              "image": "asparagus.png"
            }
          ],
          "equipment": []
        },
        {
          "number": 2,
          "step": "Heat the olive oil in a medium pan on medium heat.",
          "ingredients": [
            {
              "id": 4053,
              "name": "olive oil",
              "localizedName": "olive oil",
              "image": "olive-oil.jpg"
            }
          ],
          "equipment": [
            {
              "id": 404645,
              "name": "frying pan",
              "localizedName": "frying pan",
              "image": "pan.png"
            }
          ]
        },
        {
          "number": 3,
          "step": "Add in the asparagus and cook, stirring frequently, for 4-5 minutes until they are fork tender.",
          "ingredients": [
            {
              "id": 11011,
              "name": "asparagus",
              "localizedName": "asparagus",
              "image": "asparagus.png"
            }
          ],
          "equipment": [],
          "length": {
            "number": 5,
            "unit": "minutes"
          }
        },
        {
          "number": 4,
          "step": "Add in the garlic and ginger and cook 1 minute. Then, add in the orange juice and simmer for 1 minute, or until evaporated.",
          "ingredients": [
            {
              "id": 9206,
              "name": "orange juice",
              "localizedName": "orange juice",
              "image": "orange-juice.jpg"
            },
            {
              "id": 11215,
              "name": "garlic",
              "localizedName": "garlic",
              "image": "garlic.png"
            },
            {
              "id": 11216,
              "name": "ginger",
              "localizedName": "ginger",
              "image": "ginger.png"
            }
          ],
          "equipment": [],
          "length": {
            "number": 2,
            "unit": "minutes"
          }
        },
        {
          "number": 5,
          "step": "Remove from the heat and stir in the sesame oil and salt.",
          "ingredients": [
            {
              "id": 4058,
              "name": "sesame oil",
              "localizedName": "sesame oil",
              "image": "sesame-oil.png"
            },
            {
              "id": 2047,
              "name": "salt",
              "localizedName": "salt",
              "image": "salt.jpg"
            }
          ],
          "equipment": []
        },
        {
          "number": 6,
          "step": "DEVOUR!",
          "ingredients": [],
          "equipment": []
        }
      ]
    }
  ],
  "originalId": null
};
