import render from "./teacherRender.js";

// make webpack load the file only if it exists
const X= TEST_PREFIX;

let Show;
try{
    Show=require("/src/vuejs/"+X+"show.js").default;
}catch(e){
    render(<div>
             Please write /src/vuejs/show.js
           </div>,  document.getElementById('root'));
}
if(Show){
    render(
        <div>
          <Show hash="#one">Hash is #one</Show>
          <Show hash="#two">It's #two</Show>
          <Show hash="#three">Now is #three</Show>
        </div>,
        document.getElementById('root')
    );
}





