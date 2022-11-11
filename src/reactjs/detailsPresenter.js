import DetailsView from "../views/detailsView.js";
import promiseNoData from "../views/promiseNoData.js";

export default function Details(props) {
const [, setNumberOfGuests] = React.useState();
const [, setDishes] = React.useState();
const [,setPromise]=React.useState();
const [, setData]=React.useState();
const [, setError]=React.useState();

function observerACB(){ 
    setNumberOfGuests(props.model.numberOfGuests);
    setDishes(props.model.dishes);
    setPromise(props.model.currentDishPromiseState.promise);
    setData(props.model.currentDishPromiseState.data); 
    setError(props.model.currentDishPromiseState.error); 
}

function wasCreatedACB(){  
    props.model.addObserver(observerACB);                               
    function isTakenDownACB(){ props.model.removeObserver(observerACB);} 
    return isTakenDownACB;
}
React.useEffect(wasCreatedACB, []);

  function addToMenuACB() {
    props.model.addToMenu(props.model.currentDishPromiseState.data);
  }
  function currentDishCB(dish) {
    if(dish.id === props.model.currentDishPromiseState.data.id)
        return true;
    return false;
  }
  return (
    promiseNoData(props.model.currentDishPromiseState) || <DetailsView  dishData={props.model.currentDishPromiseState.data}
                                                                        isDishInMenu={props.model.dishes.filter(currentDishCB)[0] !== undefined }
                                                                        guests={props.model.numberOfGuests}
                                                                      onAddToMenuACB={addToMenuACB} />
  );
}