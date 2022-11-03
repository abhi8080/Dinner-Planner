import DetailsView from "../views/detailsView.js";
import promiseNoData from "../views/promiseNoData.js";
import {getDishDetails, searchDishes} from '../dishSource.js'
import resolvePromise from "../resolvePromise";

export default function Details(props) {
  function addToMenuACB() {
    props.model.addToMenu(dish.id);
  }
  function currentDishCB(dish) {
    if( dish.id === props.model.currentDish )
        return true;
    return false;
  }
  return (
    promiseNoData(resolvePromise(getDishDetails(props.model.currentDish),props.model.currentDishPromiseState)) || <DetailsView   dishData={resolvePromise(getDishDetails(props.model.currentDishPromiseState), props.model.this.searchResultsPromiseState)}
                                                        isDishInMenu={props.model.dishes.filter(currentDishCB) !== [] }
                                                        guests={props.model.numberOfGuests}
                                                        onAddToMenuACB={addToMenuACB}
    />
  );
}