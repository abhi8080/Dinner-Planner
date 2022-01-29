import render from "./teacherRender.js";

const X= TEST_PREFIX;
let searchDishes;
let SearchResultsView;

try{
    searchDishes= require("/src/"+X+"dishSource.js").searchDishes;
    SearchResultsView=require("/src/views/"+X+"searchResultsView.js").default;
    if(!searchDishes || !SearchResultsView)throw "not defined";
}catch(e){
    render(<div>Please write /src/dishSource.js and export searchDishes<br/>
             Please write /src/views/searchResultsView.js to define SearchResultsView
           </div>,  document.getElementById('root'));
}
if(searchDishes && SearchResultsView){
    render(
        <div>Wait...</div>,
        document.getElementById('root')
    );
    searchDishes({query:"pizza", type:"main course"}).then(
        function testACB(results){
            render(
                <SearchResultsView searchResults={results}
                                   FIXMEcustomEvent3={function resultChosenACB(searchResult){ console.log("user chose searchResult: ", JSON.stringify(searchResult)); }}
                />
                , document.getElementById('root')
            );
        });
}
