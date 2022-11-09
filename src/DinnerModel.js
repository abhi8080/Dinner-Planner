import dishesConst from "../test/dishesConst";
import resolvePromise from "./resolvePromise";

import {getDishDetails, searchDishes} from './dishSource.js'

/* This is an example of a JavaScript class.
   The Model keeps only abstract data and has no notions of graohics or interaction
*/
class DinnerModel {
  constructor(nrGuests = 2, dishArray = [], currentDish) {
    this.observers = [];
    this.setNumberOfGuests(nrGuests);
    this.dishes = dishArray;
    this.searchResultsPromiseState = {};
    this.searchParams = {};
    this.currentDishPromiseState = {};
  }
  setNumberOfGuests(nr) {
    // if() and throw exercise
    // TODO throw an error if the argument is smaller than 1 or not an integer
    if (nr < 1 || !Number.isInteger(nr))
      throw "number of guests not a positive integer";

    if(nr !== this.numberOfGuests) {
      this.numberOfGuests = nr;
      this.notifyObservers({nrOfGuests: nr})
    }
    // the error message must be exactly "number of guests not a positive integer"
    // to check for integer: test at the console Number.isInteger(3.14)
    // TODO if the argument is a valid number of guests, store it in this.numberOfGuests
    // when this is done the TW1.1 DinnerModel "can set the number of guests" should pass
    // also "number of guests is a positive integer"
  }
  addToMenu(dishToAdd) {
    // array spread syntax example. Make sure you understand the code below.
    // It sets this.dishes to a new array [   ] where we spread (...) the previous value
    for(let i = 0; i < this.dishes.length; i++) {
      if(this.dishes[i].id === dishToAdd.id)
         return;
    }
    this.dishes = [...this.dishes, dishToAdd];
    this.notifyObservers({addDish: dishToAdd});
  }

  removeFromMenu(dishToRemove) {
    function hasSameIdCB(dish) {
      if (dish.id != dishToRemove.id) return true;

      return false;
      // TODO return true if the id property of dish is _different_ from the dishToRemove's id property
      // This will keep the dish when we filter below.
      // That is, we will not keep the dish that has the same id as dishToRemove (if any)
    }
    let isDishInMenu = false;
    for(let i = 0; i < this.dishes.length; i++) {
        if(this.dishes[i].id === dishToRemove.id)
              isDishInMenu = true;
    }
    if(!isDishInMenu)
       return;
    this.dishes = this.dishes.filter(hasSameIdCB);
    this.notifyObservers({removeDish: dishToRemove});
  }
  /* 
       ID of dish currently checked by the user.
       A strict MVC/MVP Model would not keep such data, 
       but we take a more relaxed, "Application state" approach. 
       So we store also abstract data that will influence the application status.
     */
  setCurrentDish(id) {

    if(id !== undefined && id !== this.currentDish)
    resolvePromise(getDishDetails(id),this.currentDishPromiseState, this.notifyObservers.bind(this));

    if(this.currentDish !== id) {
      this.currentDish = id;
      this.notifyObservers({currDish: id})
    }

  }
  setSearchQuery(q) {
    this.searchParams.query = q;
  }

  setSearchType(t) {
    this.searchParams.type = t;
  }
  doSearch(params) {
      resolvePromise(searchDishes(params),this.searchResultsPromiseState, this.notifyObservers.bind(this));
  }
  addObserver(callback) {
    this.observers = [...this.observers, callback];
  }
  removeObserver(callback) {
    function removeObserverFromObserversArray(observer) {
      return observer !== callback
    }
    this.observers = this.observers.filter(removeObserverFromObserversArray)
  }

  notifyObservers(payload) {
    try{this.observers.forEach(function invokeObserverCB(obs){obs(payload);})}catch(err){console.error(err); } 
  }

}
export default DinnerModel;