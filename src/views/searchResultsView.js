function SearchResultsView(props) {

    function dishClickACB() {
        return;
    }
    function searchResultCB(searchResult) {
        return <span class="searchResult" key={searchResult.id} onClick={dishClickACB}>
                    <img src={searchResult.image} onClick={dishClickACB} height={100}/>
                    <div onClick={dishClickACB}>{searchResult.title}</div>
                </span >
    } 
    
        console.log(props.searchResults);
    return <div>
        {props.searchResults.map(searchResultCB)}
    </div>;

}

export default SearchResultsView;
