import render from "./teacherRender.js";

// make webpack load the file only if it exists
const SummaryView=require("/src/views/"+TEST_PREFIX+"summaryView.js").default;

render(
        <SummaryView people={3} ingredients={[]}/>,
    document.getElementById('root')
);


    
