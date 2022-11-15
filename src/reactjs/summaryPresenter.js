import SummaryView from "../views/summaryView.js";
import { shoppingList } from "../utilities.js";

export default function Summary(props) {
const [numberOfGuests, setNumberOfGuests] = React.useState(props.model.numberOfGuests);
const [dishes, setDishes] = React.useState(props.model.dishes);

function observerACB(){ setNumberOfGuests(props.model.numberOfGuests); setDishes(props.model.dishes);}

function wasCreatedACB(){  
    props.model.addObserver(observerACB);                               
    function isTakenDownACB(){ props.model.removeObserver(observerACB);} 
    return isTakenDownACB;
}

React.useEffect(wasCreatedACB, []);

  return (
    <SummaryView
      people={numberOfGuests}
      ingredients={
        shoppingList(dishes)
      }
    />
  );
}