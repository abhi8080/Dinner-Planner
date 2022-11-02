import render from "./teacherRender.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;

const DinnerModel=require("/src/"+TEST_PREFIX+"DinnerModel.js").default;

const App=require("/src/views/"+TEST_PREFIX+"app.js").default;

    const model= new DinnerModel();
    model.addObserver(console.log);
    window.myModel=model;
    render(
        <App model={model}/>,
        document.getElementById('root')
    );       

