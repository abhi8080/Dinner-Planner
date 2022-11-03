import DetailsView from "../views/detailsView.js";
import promiseNoData from "../views/promiseNoData.js";

export default function Details(props) {
  function addToMenuACB() {
    props.model.addToMenu(props.model.currentDishPromiseState.data);
  }
  function currentDishCB(dish) {
    if( dish.id === props.model.currentDishPromiseState.data.id )
        return true;
    return false;
  }
  
  return (
    promiseNoData(props.model.currentDishPromiseState) || <DetailsView  dishData={props.model.currentDishPromiseState.data}
                                                                        isDishInMenu={props.model.dishes.filter(currentDishCB)[0] !== undefined }
                                                                        guests={props.model.numberOfGuests}
                                                                        onAddToMenuACB={addToMenuACB}
    />
  );
}