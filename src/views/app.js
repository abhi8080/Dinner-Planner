//import SidebarView from "./sidebarView";
//import Show from ".../reactjs/show.js";

/* 
   This component uses Vue-specific and React-specific presenters: Sidebar, Summary, Search, Details, Show 
   Therefore it needs to import from alternative paths, depending on the framework. 
   To achieve that, we use require() with a prefix, instead of import.
*/
const PREFIX = window.location.toString().includes("vue")
  ? "vuejs"
  : "reactjs";

const Summary = require("../" + PREFIX + "/summaryPresenter.js").default;
const Sidebar = require("../" + PREFIX + "/sidebarPresenter.js").default;
const Search = require("../" + PREFIX + "/searchPresenter.js").default;
const Details = require("../" + PREFIX + "/detailsPresenter.js").default;
const Show = require("../" + PREFIX + "/show.js").default;

export default function App(props) {
  return (
  <div class="app">
    <header><h1>Dinner Planner</h1><p>Making dinner has never been this easy...</p></header>
    <div class="flexParent">
      <div class="sidebar"><Sidebar model={props.model} /></div>
      <div class="mainContent">
        <Show hash="#summary"><Summary model={props.model} /></Show>
        <Show hash="#search"><Search model={props.model} /></Show>
        <Show hash="#details"><Details model={props.model} /></Show>
      </div>
    </div>
  </div>
  );
}