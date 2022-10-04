/*
  The API used in the lab (Spoonacular) returns dishes with several types, kept in an array such as
  ["brunch", "lunch", "main course"]
  From these types, we have to keep just one, either one of the 3 "known types" below.
  Most dishes returned by the API have exactly one of thes 3 "known" types.
  Your job is to write a callback that checks whether a given type is known.
  The callback will then be sent to `Array.filter()`, so we keep only knwon types. For example:

  ["brunch", "lunch", "main course"].filter(isKnownTypeCB)  will return ["main course"]
*/
const knownTypes=["starter", "main course", "dessert"];

function isKnownTypeCB(type){
    // hint: you can use knownTypes.indexOf(TODO) and check if it's not negative. Don't forget the return keyword.
    // OR 
    // hint: knownTypes.find(anotherCB) . In this case you will have to define
    // function anotherCB(knownType) inside isKnownType, so that it has access to the `type` argument.

    // hint: once this function is written, a test should pass! Use the tests to check your work.
}

/* Now pass the callback to `Array.filter()` */
function dishType(dish){
    if(dish.dishTypes !== undefined){  // or more general: if(dish.dishTypes)   , see JS truthy / falsy
        const tp= dish.dishTypes.filter(/* TODO pass the callback */);
        if(tp.length > 0)
            return tp[0];
    }
    return "";
    // hint: once this function is completed, more tests should pass! Use the tests to check your work.
}

/* 
   Write a sort() comparator callback that compares dishes by their type, 
   so that all starters come before main courses and main courses come before desserts 
*/
function __give_a_proper_name_CB(dishA, dishB){
    // hint: use dishType(dishA) and dishType(dishB)
    // hint: use Array.indexOf() to get the index of the type within `knownTypes`
    // once you know the integer indices, simply compare them
    // return negative, 0 or positive, see Array.sort() documentation
}


/* 
   We sort the dishes using the comparator above.
   Note that sort() will change the original array. 
   To avoid that, use [...dishes] which creates a new array and spreads the elements of the `dishes` array.
*/
function sortDishes(dishes){
    // hint: use someArray.sort(comparator_above_CB)
    // check the tests, look for sortDishes!
    return //TODO
}

/* 
   Given an array of ingredients, we would like to order them by supermarket aisle. If the aisles are the same, we order them by name 
   Each ingredient object has aisle and name properties.

   You know the drill: write a comparator callback, then pass it to Array.sort(). 

   Remember that sort changes the original array and we don't want that.
*/
function sortIngredients(ingredients){
    // TODO
}

/* 
   Given a menu of dishes, generate a list of ingredients. 
   If an ingredient repeats in several dishes, it will be returned only once, with the amount added up 
   
   As this is not an algorithm course, the function is mostly written but you have 2 callback passing TODOs.
*/
function shoppingList(dishes){
    // we define the callback inside the function, though this is not strictly needed in this case. But see below.
    function keepJustIngredientsCB(dish){
        return dish.extendedIngredients;
    }
    
    const result={}; // object used as mapping between ingredient ID and ingredient object

    // ingredientCB must be defined inside shopingList() because it needs access to `result`
    // you will often need to define a callback inside the function where it is used, so it has access to arguments and other variables
    function ingredientCB(ingredient){
        if(result[ingredient.id] === undefined){  // more general: !result[ingredient.id]
            // since result[ingredient.id] is not defined, it means that the ingredient is not taken into account yet
            // so we associate the ingredient with the ID
            result[ingredient.id]={...ingredient};
            
            // JS Notes about the line above:
            // 1)    result[ingredient.id] 
            // In JS object.property is the same as object["property"] but the second notation is more powerful because you can write
            // object[x]  where x=="property"
            
            // 2)    {...ingredient } creates a *copy* of the ingredient (object spread syntax)
            // we duplicate it because we will change the object below
        } else {
            // since result[ingredient.id] is not defined, it means that the ingredient has been encountered before.
            // so we add up the amount:
            result[ingredient.id].amount +=  ingredient.amount;
        }
    }

    const arrayOfIngredientArrays= dishes.map(/*TODO pass the callback that transforms a dish to its ingredients */);
    const allIngredients= arrayOfIngredientArrays.flat();    
    allIngredients.forEach(/* TODO: pass the callback that treats an ingredient */);

    // Note: the 3 lines above can be written as a function chain:
    // dishes.map(callback1).flat().forEach(callback2);

    // now we transform the result object into an array: we drop the keys and only keep the values
    return Object.values(result);
}

/* Given a dish array, calculate their total price with a map-reduce callback exercise */
function menuPrice(dishesArray){
    // TODO callback1: given a dish, return its price. Look in /test/dishesConst.js to find out the name of the dish price property. 
    // TODO callback2, with two parameters. Return the sum of the parameters
    // TODO set proper names to the callbacks!
    
    // TODO 1) call dishesArray.map() with callback1 as argument. This will return an array of prices.
    // TODO 2) on the array of prices, call reduce() with the second calback as first parameter, and 0 as second parameter (we compute the total starting from zero).
    //        This will produce the total price, which you return
}
/*
  At this point, all of TW1.1 tests should pass!
*/

/*
  Optional: once you are done with the whole TW1, 
  if you want to learn more functional programming, you may want to rewrite shoppingList(dishes) 
  The unit tests will help you determine if your code is equivalent with the above.

  Problem: ingredientCB is not a pure function because it has a side effect: it changes the result object. 
  Instead, you can use reduce to produce the result object.

  allIngredients.reduce(amountReducerCB, {}), i.e. use an object as accumulator.
  
  To create new objects in the reducer CB, you can use either spread syntax {...object, other:property}  or Object.assign() 

  shoppingList() then becomes:
  return Object.values(dishes.map(callback1).flat().reduce(amountReducerCB, {}))
  
  And you can even move both callback definitions outside shoppingList() . Creating functions inside functions is more expensive 
  because the new function object is re-created and interpreted every time the enclosing function runs.
*/

export {isKnownTypeCB, dishType, sortDishes, sortIngredients, shoppingList, menuPrice};

