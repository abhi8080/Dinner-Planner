import dishesConst from "../test/dishesConst";
import resolvePromise from "./resolvePromise";

import {getDishDetails, searchDishes} from './dishSource.js'

/* This is an example of a JavaScript class.
   The Model keeps only abstract data and has no notions of graohics or interaction
*/
class DinnerModel {
  constructor(nrGuests = 2, dishArray = [], currentDish) {
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

    this.numberOfGuests = nr;
    // the error message must be exactly "number of guests not a positive integer"
    // to check for integer: test at the console Number.isInteger(3.14)
    // TODO if the argument is a valid number of guests, store it in this.numberOfGuests
    // when this is done the TW1.1 DinnerModel "can set the number of guests" should pass
    // also "number of guests is a positive integer"
  }
  addToMenu(dishToAdd) {
    // array spread syntax example. Make sure you understand the code below.
    // It sets this.dishes to a new array [   ] where we spread (...) the previous value
    this.dishes = [...this.dishes, dishToAdd];
  }

  removeFromMenu(dishToRemove) {
    // callback exercise! Also return keyword exercise
    function hasSameIdCB(dish) {
      if (dish.id != dishToRemove.id) return true;

      return false;
      // TODO return true if the id property of dish is _different_ from the dishToRemove's id property
      // This will keep the dish when we filter below.
      // That is, we will not keep the dish that has the same id as dishToRemove (if any)
    }
    this.dishes = this.dishes.filter(hasSameIdCB);
    // the test "can remove dishes" should pass
  }
  /* 
       ID of dish currently checked by the user.
       A strict MVC/MVP Model would not keep such data, 
       but we take a more relaxed, "Application state" approach. 
       So we store also abstract data that will influence the application status.
     */
  setCurrentDish(id) {
    if(id !== undefined && id !== this.currentDish)
      resolvePromise(getDishDetails(id),this.currentDishPromiseState);
    this.currentDish = id;
  }

  setSearchQuery(q) {
    this.searchParams.query = q;
  }

  setSearchType(t) {
    this.searchParams.type = t;
  }

  doSearch(params) {
    if(params["query"] === undefined || params["type"] === undefined )
      resolvePromise(searchDishes(" "),this.searchResultsPromiseState);
    else
      resolvePromise(searchDishes(params["query"]+" "+params["type"]),this.searchResultsPromiseState);
  }
  doSearch() {
    if(this.searchParams.query === undefined || this.searchParams.type === undefined )
      resolvePromise(searchDishes(" "),this.searchResultsPromiseState);
    else
      resolvePromise(searchDishes(this.searchParams.query+" "+this.searchParams.type),this.searchResultsPromiseState);
  }
}
export default DinnerModel;