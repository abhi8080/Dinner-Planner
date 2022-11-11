import { dishType, sortDishes, menuPrice } from "../utilities.js";
function SidebarView(props) {
  function minusButtonCB() {
    props.onNumberChange(props.number - 1);
  }

  function plusButtonCB() {
    props.onNumberChange(props.number + 1);
  }
  
  function renderDishCB(dish){
    function removeDishCB() {
      props.removeDish(dish);
    }

    function setCurrentDishCB() {
      props.currentDish(dish);
    }
    return (
      <tr key={dish.id}>
        <td>
          <button onClick={removeDishCB}>x</button>
        </td>

        <td>
          <a href="#details" onClick={setCurrentDishCB}>
            {dish.title}
          </a>
        </td>

        <td>{dishType(dish)}</td>
        <td className="quantity">
          {(dish.pricePerServing * props.number).toFixed(2)}
        </td>
      </tr>
    );
  }

  return (
    <div className="sidebarChild">
      Number of guests: 
      <button disabled={props.number === 1} onClick={minusButtonCB}>
        -
      </button>
      <span>{props.number}</span>
      <button onClick={plusButtonCB}>+</button>
      <table className="sidebarTable">
        <tbody>
          {sortDishes(props.dishes).map(renderDishCB)}
          <tr className="sidebarMenuTotal">
            <td></td>
            <td>Total</td>
            <td></td>
            <td>
              {(menuPrice(props.dishes) * props.number).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SidebarView;
