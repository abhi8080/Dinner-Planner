import render from "./teacherRender.js";


// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+X+"DinnerModel.js").default;
try{
    if(!DinnerModel.prototype.doSearch) throw "not defined";
}catch(e){
    render(<div>
             Please write /src/views/promiseNoData.js
             <br/>Please write DinnerModel.doSearch()
           </div>,  document.getElementById('root'));
}
if(DinnerModel.prototype.doSearch){
    const VueRoot={
        data(){
            return {rootModel: new DinnerModel()} ;
        } ,
        render(){
            if(!this.rootModel.searchResultsAsync)
                this.rootModel.doSearch();

            return <div>
                   search results promise state: {JSON.stringify(this.rootModel.searchResultsAsync)}
               </div>;
        },
    };
    
    render(
        <VueRoot/>
        ,    document.getElementById('root')
    );
}

