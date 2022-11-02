import SummaryView from "../views/summaryView.js";

export default
function Summary(props){
    return <SummaryView people={props.model.numberOfGuests} ingredients={[] /* empty array for starters */}/>;
}
