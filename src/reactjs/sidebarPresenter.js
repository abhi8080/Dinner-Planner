import SidebarView from "../views/sidebarView.js";

export default function Sidebar(props) {
const [numberOfGuests, setNumberOfGuests] = React.useState(props.model.numberOfGuests);
const [dishes, setDishes] = React.useState(props.model.dishes);

function observerACB(){ setNumberOfGuests(props.model.numberOfGuests); setDishes(props.model.dishes);}

function wasCreatedACB(){  
    props.model.addObserver(observerACB);                               
    function isTakenDownACB(){ props.model.removeObserver(observerACB);} 
    return isTakenDownACB;
}

React.useEffect(wasCreatedACB, []);

  function changeNumberOfGuestsCB(number) {
    props.model.setNumberOfGuests(number);
  }

  function removeDishCB(dish) {
    props.model.removeFromMenu(dish);
  }
  function setCurrentDishCB(dish) {
    props.model.setCurrentDish(dish.id);
  }
  return (
    <SidebarView
      number={numberOfGuests}
      onNumberChange={changeNumberOfGuestsCB}
      dishes={dishes}
      removeDish={removeDishCB}
      currentDish={setCurrentDishCB}
    />
  );
}