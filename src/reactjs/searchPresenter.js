import SearchFormView from "../views/searchFormView.js";
import resolvePromise from "../resolvePromise";
import SearchResultsView from "../views/searchResultsView.js";
import promiseNoData from "../views/promiseNoData.js";
import {searchDishes} from '../dishSource.js'

function SearchPresenter(props) {
    const [searchText, setSearchText] = React.useState("");
    const [dishType, setDishType] = React.useState("");
    const [resultsPromiseState ] = React.useState({});
    const [error, setError] = React.useState({});
    const [data, setData] = React.useState({});

    function resolve(thePromise) {
        function promiseStateChangedACB() {
            setError(resultsPromiseState["error"]);
            setData(resultsPromiseState["data"]);
        } 
        resolvePromise(thePromise, resultsPromiseState, promiseStateChangedACB );
    }

    function wasCreatedACB() {
        resolve(searchDishes({query:"", type:""}));
    }

    function searchNowACB() {
        resolve(searchDishes({query:searchText, type:dishType}));
    }
    function handleSearchTextACB(searchText) {
        setSearchText(searchText);
    }
    function handleSearchDishTypeACB(dishType) {
        setDishType(dishType);
    }

    function selectChosenACB(dish) {
        props.model.setCurrentDish(dish.id);
    }

    React.useEffect(wasCreatedACB, []);
    
    return(
        <div>
            <SearchFormView onSetSearchText = {handleSearchTextACB} 
            onSetSearchType = {handleSearchDishTypeACB}
            onSearchNow = {searchNowACB}
            dishTypeOptions={["starter","main course","dessert"]}
            />
            {promiseNoData(resultsPromiseState) || (
                <SearchResultsView
                searchResults={data}
                onSelectChosen={selectChosenACB}
                />
            )}
        </div>
    )
}
export default SearchPresenter;