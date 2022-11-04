function SearchResultsView(props) {
    function searchResultCB(searchResult) {

        function dishClickACB() {
            props.onSelectChosen(searchResult)
        }
        return <span class="searchResult" key={searchResult.id} onClick={dishClickACB}>
                    <img src={searchResult.image} height='100'/>
                    <div>{searchResult.title}</div>
                </span >
        //Following line makes test TW2.3 SearchResultsView pass but makes images not render
        return <span class="searchResult" key={searchResult.id} onClick={dishClickACB}>
                    <img src={"https://spoonacular.com/recipeImages/" + searchResult.image} height='100'/>
                    <div>{searchResult.title}</div>
                </span >
    }
    return <div class="searchResultsView">
        {props.searchResults.map(searchResultCB)}
    </div>;

}

export default SearchResultsView;
