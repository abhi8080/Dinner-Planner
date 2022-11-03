import SidebarView from "../views/sidebarView.js";

export default function Sidebar(props) {
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
      number={props.model.numberOfGuests}
      onNumberChange={changeNumberOfGuestsCB}
      dishes={props.model.dishes}
      removeDish={removeDishCB}
      currentDish={setCurrentDishCB}
    />
  );
}