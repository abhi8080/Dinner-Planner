import DetailsView from "../views/detailsView.js";
import promiseNoData from "../views/promiseNoData.js";

export default function Details(props) {
const [numberOfGuests, setNumberOfGuests] = React.useState(props.model.numberOfGuests);
const [dishes, setDishes] = React.useState(props.model.dishes);
const [currentDishPromiseState, setCurrentDishPromiseState] = React.useState(props.model.currentDishPromiseState);

function observerACB(){ setNumberOfGuests(props.model.numberOfGuests); setDishes(props.model.dishes); setCurrentDishPromiseState(props.model.currentDishPromiseState)}

function wasCreatedACB(){  
    props.model.addObserver(observerACB);                               
    function isTakenDownACB(){ props.model.removeObserver(observerACB);} 
    return isTakenDownACB;
}

React.useEffect(wasCreatedACB, []);

  function addToMenuACB() {
    props.model.addToMenu(currentDishPromiseState.data);
  }
  function currentDishCB(dish) {
    if( dish.id === currentDishPromiseState.data.id )
        return true;
    return false;
  }
  return (
    promiseNoData(currentDishPromiseState) || <DetailsView  dishData={currentDishPromiseState.data}
                                                                        isDishInMenu={dishes.filter(currentDishCB)[0] !== undefined }
                                                                        guests={numberOfGuests}
                                                                        onAddToMenuACB={addToMenuACB}
    />
  );
}