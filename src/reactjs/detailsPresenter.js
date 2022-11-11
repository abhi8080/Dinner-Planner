import DetailsView from "../views/detailsView.js";
import promiseNoData from "../views/promiseNoData.js";

export default function Details(props) {
const [numberOfGuests, setNumberOfGuests] = React.useState(props.model.numberOfGuests);
const [dishes, setDishes] = React.useState(props.model.dishes);
const [currentDishPromiseState,setCurrentDishPromiseState]=React.useState(props.model.currentDishPromiseState);
const [,setPromise]=React.useState();
const [data, setData]=React.useState(props.model.currentDishPromiseState.data);
const [, setError]=React.useState();

function observerACB(){ 
    setNumberOfGuests(props.model.numberOfGuests);
    setDishes(props.model.dishes);
    setCurrentDishPromiseState(props.model.currentDishPromiseState);
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
    props.model.addToMenu(data);
  }
  function currentDishCB(dish) {
    if( dish.id === data.id )
        return true;
    return false;
  }

  return (
    promiseNoData(currentDishPromiseState) || <DetailsView  dishData={data}
                                                                        isDishInMenu={dishes.filter(currentDishCB)[0] !== undefined }
                                                                        guests={numberOfGuests}
                                                                      onAddToMenuACB={addToMenuACB} />
  );
}