import render from "./teacherRender.js";

const X= TEST_PREFIX;
let searchDishes;

try{
    searchDishes= require("/src/"+X+"dishSource.js").searchDishes;
    if(!searchDishes)throw "searchDishes not defined";
}catch(e){
    render(<div>Please write /src/dishSource.js and export searchDishes</div>,  document.getElementById('root'));
}
if(searchDishes){
    render(
        <div>Wait...</div>,
        document.getElementById('root')
    );
    searchDishes({query:"pizza", type:"main course"}).then(
        function testACB(results){
            render(
                <ol>{
                    results.map(function eachResultCB(dishResult){
                        return <li key={dishResult.id}>{JSON.stringify(dishResult)}</li>;
                    })
                }</ol>,
                document.getElementById('root')
            );
        }).catch(function errorACB(err){
            render(<div>{err}</div>,document.getElementById('root'));
        });

}
