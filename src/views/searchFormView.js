function SearchFormView(props) {
    function dishOptionCB(dishTypeOption) {
        return <option>{dishTypeOption}</option>
    }

    function searchClickACB(){
        return;
    }
    function selectChangeACB(){
        return;
    }

    function textChangeACB(){
        return;
    }

    console.log(props);

    return <div>
        <input onChange={textChangeACB}>
        </input>
        <select onChange={selectChangeACB}>
            <option>Choose:</option>
            {props.dishTypeOptions.map(dishOptionCB)}
        </select>
        <button onClick={searchClickACB}>Search!</button>
    </div>;

}

export default SearchFormView;
