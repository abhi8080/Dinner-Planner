function DetailsView(props) {

    function ingredientRowCB(ingredient) {
        return <div id={ingredient.id}>
            • {ingredient.name}: {ingredient.amount} {ingredient.unit}
        </div>;
    }

    function cancelACB() {
        window.location.hash="search";
    }

    function addToMenuACB() {
        props.onAddToMenuACB();
        window.location.hash="search";
    }

    return <div class="detailsView">
    <h1>{props.dishData.title}</h1>
    <img src={props.dishData.image}/>
    <span>
        
    </span>
    <h2>Ingredients</h2>
    <div class="dishDetailIngredients">
        {props.dishData.extendedIngredients.map(ingredientRowCB)}
    </div>
    <h2>Instruction</h2>
    <div class="dishDetailInstruction">
        {props.dishData.instructions}
    </div>
    <div class="detailsViewPrice">Price: {props.dishData.pricePerServing}</div>
    <div class="detailsViewPrice">for {props.guests} guests: {(props.guests*props.dishData.pricePerServing).toFixed(2)}</div>
    <div class="detailsViewButtonWrapper">
        <a href={props.dishData.sourceUrl}>More Information</a>
        <button onClick={cancelACB}>Cancel</button>
        <button onClick={addToMenuACB} disabled={props.isDishInMenu}>Add to Menu</button>
    </div>
</div>;

}

export default DetailsView;
