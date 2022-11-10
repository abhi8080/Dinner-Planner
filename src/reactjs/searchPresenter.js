import SearchFormView from "../views/searchFormView.js";
import resolvePromise from "../resolvePromise";
import SearchResultsView from "../views/searchResultsView.js";
import promiseNoData from "../views/promiseNoData.js";

function SearchPresenter(props) {
    const [searchText, setSearchText] = React.useState("");
    const [dishType, setDishType] = React.useState("");
    const [promiseState] = React.useState({});
    const [error, setError] = React.useState({});
    const [data, setData] = React.useState({});
    const[, reRender]=  React.useState();

    function resolve(promise){
        resolvePromise(promise, promiseState, 
      function promiseStateChangedACB(){ reRender(new Object()); }  );
  }

  React.useEffect(function createdACB(){ resolve(props.model.doSearch({}))}, []);

    function selectChosenACB(dish) {
        props.model.setCurrentDish(dish.id);
    }
    return(
        <div>
            <SearchFormView onSetSearchText = {function handleSearchTextACB(searchText){setSearchText(searchText)}} 
            onSetSearchType = {function handleSearchDishTypeACB(dishType){ setDishType(dishType)}}
            onSearchNow = {function handleSearchNow(){ resolve(props.model.doSearch({query:searchText, type:dishType}));} }
            dishTypeOptions={["starter","main course","dessert"]}
            />
            {promiseNoData(promiseState) || (
                <SearchResultsView
                searchResults={data}
                onSelectChosen={selectChosenACB}
                />
            )}
        </div>
    )
}
export default SearchPresenter;