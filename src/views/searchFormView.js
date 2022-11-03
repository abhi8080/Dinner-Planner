function SearchFormView(props) {
    function dishOptionCB(dishTypeOption) {
        return <option>{dishTypeOption}</option>
    }

    function searchClickACB(){
        props.onSearch();
    }
    function selectChangeACB(event){
        props.onSelect(event.target.value);
    }

    function textChangeACB(event){
        props.onTextChange(event.target.value);
    }

    return <div>
        <input onChange={textChangeACB}>
        </input>
        <select onChange={selectChangeACB}>
            <option value="">Choose:</option>
            {props.dishTypeOptions.map(dishOptionCB)}
        </select>
        <button onClick={searchClickACB}>Search!</button>
    </div>;

}

export default SearchFormView;
