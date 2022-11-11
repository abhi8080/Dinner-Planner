import { sortIngredients } from "../utilities.js";

/* Functional JSX component. Name starts with capital letter */
function SummaryView(props) {
  
  /* This is an ordinary JS function, not a component. It will be invoked from the component above */
  function renderIngredients(ingredientArray, people) {
    function ingredientTableRowCB(ingr) {
      return (
        <tr key={ingr.id}>
        <td>{ingr.name}</td> <td>{ingr.aisle}</td>
        <td className="quantity">{(ingr.amount * people).toFixed(2)}</td>
        <td>{ingr.unit}</td>
        </tr>
      );
    }

    return (
      <table className="summaryTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Aisle</th>
            <th>Quantity</th>
            <th>unit</th>
          </tr>
        </thead>
        <tbody>
          {
            //  <---- we are in JSX, with this curly brace, we go back to JavaScript

            sortIngredients(ingredientArray).map(ingredientTableRowCB)
          }
        </tbody>
      </table>
    );
  }

  function backToSearchACB() {
    window.location.hash="search";
  }

  return (
    <div className="summaryViewChild">
      Dinner for <span title="nr guests">{props.people}</span> guests:
      <button onClick={backToSearchACB}>Back to Search</button>
      {
        //  <---- we are in JSX; with this curly brace, we go back to JavaScript, and can write JS code and comments.
        // Then we can come back to JSX <tags>
        renderIngredients(props.ingredients, props.people)
      }
    </div>
  );
}
export default SummaryView;
//export { renderIngredients };