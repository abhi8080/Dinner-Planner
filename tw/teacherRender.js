let render;

if(window.location.toString().includes("react")){
    render=require("react-dom").render;
    window.React= require("react");
    console.log("rendering "+window.location.pathname+" with React");
}else{
    render=require("vue").render;
    window.React={createElement: require("vue").h};
    console.log("rendering "+window.location.pathname+" with Vue");
}

export default render;
