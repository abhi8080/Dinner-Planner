import SearchFormView from "../views/searchFormView.js";
import SearchResultsView from "../views/searchResultsView.js";
import promiseNoData from "../views/promiseNoData.js";
import { processExpression } from "@vue/compiler-core";

export default function Search(props) {
    
    function selectChosenACB(dish) {
        props.model.setCurrentDish(dish.id);
    }
    function setSearchTextACB(text) {
        props.model.setSearchQuery(text)
    }
    function setSearchTypeACB(type) {
        props.model.setSearchType(type);
    }
    function searchNowACB() {
        props.model.doSearch();
    }

    if( !props.model.searchResultsPromiseState.promise )  {
        props.model.doSearch({query:"pasta", type:"main course"});
    }
    return (
        <div >
           <SearchFormView dishTypeOptions={["starter","main course","dessert"]}
                           onSetSearchText={setSearchTextACB}
                           onSetSearchType={setSearchTypeACB}
                           onSearchNow={searchNowACB}/>
           {promiseNoData(props.model.searchResultsPromiseState) || <SearchResultsView searchResults={props.model.searchResultsPromiseState.data}
                                                                                       onSelectChosen={selectChosenACB}/>}
       </div>)
}