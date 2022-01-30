import { assert, expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";
import createUI from './createUI.js';
const { render, h } = require('vue');


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

let DetailsPresenter;
let DetailsView;
const X = TEST_PREFIX;
try {
    DetailsPresenter = require("../src/vuejs/" + X + "detailsPresenter.js").default;
    DetailsView = require("../src/views/" + X + "detailsView.js").default;
} catch(e) {};

describe("TW2.5 DetailsPresenter", function() {
  this.timeout(200000);

  before(function(){
    if(!DetailsPresenter) this.skip();
  });

  it("Vue DetailsPresenter renders promise states correctly", async function(){
    installOwnCreateElement();
      DetailsPresenter({model: {currentDishPromiseState:{}}});
      expect(window.lastJSXRender.children.length).to.equal(1);
      expect(window.lastJSXRender.children[0]).to.equal("no data");
      
      DetailsPresenter({model: {currentDishPromiseState:{promise:"bla"}}});
      expect(window.lastJSXRender.tag).to.equal("img");
  });
    it("Vue DetailsPresenter renders DetailsView", async function(){
      installOwnCreateElement();
      DetailsPresenter({
          model: {
              currentDishPromiseState:{promise:"bla", data: dishInformation},
              dishes:[],
              numberOfGuests:4,
          }
      });
      expect(window.lastJSXRender.tag).to.equal(DetailsView, "DetailsPresenter should render DetailsView if the promise state includes data");
      expect(window.lastJSXRender.props.guests).to.equal(4, "DetailsView guest prop must be read from the model");
      expect(!window.lastJSXRender.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be falsy with empty menu");
      expect(window.lastJSXRender.props.dishData).to.equal(dishInformation, "DetailsView dishData prop expected to be read from the currentDish promise state");


      let dishAdded;
      DetailsPresenter({
          model: {
              currentDishPromiseState:{promise:"bla", data: dishInformation},
              dishes:[dishInformation],
              numberOfGuests:5,
              addToMenu(dish){
                  dishAdded=dish;
              }
          }
      });
      expect(!window.lastJSXRender.props.isDishInMenu, "DetailsView isDishInMenu prop expected to be truthy if the dish is in menu");  
      expect(window.lastJSXRender.props.guests).to.equal(5, "DetailsView guest prop must be read from the model");

      // find the prop sent to DetailsView that is a function, that must be the custom event handler        
      const callbackNames= Object.keys(window.lastJSXRender.props).filter(prop=> typeof window.lastJSXRender.props[prop] =="function");
      expect(callbackNames.length).to.equal(1, "Details presenter passes one custom event handler");
      window.lastJSXRender.props[callbackNames[0]]();
      expect(dishAdded).to.equal(dishInformation, "Details presenter custom event handler calls the appropriate model method");

        // now we know the name of the custom event, and can check if it is called when the button is pressed.
        // we render in DOM and press the button
      let div = createUI();
      window.React = { createElement: h };
      let buttonPressed;
        render(h(DetailsView, {
          isDishInMenu:false,
          guests:3,
          dishData:dishInformation,
          [callbackNames[0]]: function(){ buttonPressed=true;}
      }), div
            );
        div.querySelectorAll("button")[0].click();   // fixme: maybe it's not always the first button?
        expect(buttonPressed).to.equal(true, "DetailsView fires its custom event correctly");

    });
});

