import { expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";


function findTag(tag, tree){
    let tags= tree.children?tree.children.flat().map(
        function child2TagsCB(t){
            return findTag(tag, t);}
    ).flat():[];
    if(tree.tag==tag)
        tags=[tree, ...tags];
    return tags;
}

const propNames=["onClick", "onChange", "onInput"];

function findCustomEventName(tag){
    let propName;
    if(tag.tag=="input" || tag.tag=="select"){
        if(!Object.keys(tag.props).includes("onChange") && !Object.keys(tag.props).includes("onInput")){
            if(Object.keys(tag.props).includes("onchange"))
                expect.fail("onchange not accepted in the lab because it does not work with React. Please use onChange. In "+JSON.stringify(tag));
            if(Object.keys(tag.props).includes("oninput"))
                expect.fail("oninput not accepted in the lab because it does not work with React. Please use onInput. In "+JSON.stringify(tag));
            expect.fail("tag expected to define onChange or onInput native event listener. In "+JSON.stringify(tag));
        }
    }else{ 
        if(!Object.keys(tag.props).includes("onClick")){
            if(Object.keys(tag.props).includes("onclick"))
                expect.fail("onclick not accepted in the lab because it does not work with React. Please use onClick. In "+JSON.stringify(tag));
            expect.fail("tag expected to define onClick native event listener. In "+JSON.stringify(tag));
        }
    }
   
    propNames.forEach(function checkPropCB(prop){
        if(Object.keys(tag.props).includes(prop) &&typeof  tag.props[prop]!="function")
            expect.fail("Please define a named function for event listener "+prop +" of element "+JSON.stringify(tag)+".\nThis is a limitation of the tests but it will not be fixed since the course code convention is to provide named callbacks.");
    });
    try{
        if(tag.props.onChange || tag.props.onInput){
            /*
            const evt= new Event(tag.props.onChange?"change": "input",  {bubbles:true, cancellable:true});
            const input= document.createElement("input");
            input.value= "dummy";
            let transformedEvent;
            input.addEventListener(evt.type, function evtACB(e){ transformedEvent=e; });
            input.dispatchEvent(evt);
            // Problem: transformedEvent is now async. Therefore the solution below...
            */
            (tag.props.onChange || tag.props.onInput)({
                type: tag.props.onChange?"change":"input",
                bubles:true,
                cancellable:true,
                target:{value:"dummy"}
            });
        }
        else if(tag.props.onClick)
            tag.props.onClick(new Event("click",  {bubbles:true, cancellable:true}));
        
    }catch(e){
        if(e.message.indexOf(" is not a function")==-1)
            // probably a problem in the event listener code, we throw it further
            throw e;
        propName=e.message.match( /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\s+is not a function/)[0].replace(" is not a function", "");
    }
    expect(propName, "expected  "+ JSON.stringify(tag)  +"to invoke a callback prop (fire custom event)").to.be.ok;
    return propName;
}

function onlyAllowNativeEventNames(tag) {
    if(tag.tag=="input" || tag.tag=="select"){
        if(!Object.keys(tag.props).includes("onChange") && !Object.keys(tag.props).includes("onInput")){
            if(Object.keys(tag.props).includes("onchange"))
                expect.fail("onchange not accepted in the lab because it does not work with React. Please use onChange. In "+JSON.stringify(tag));
            if(Object.keys(tag.props).includes("oninput"))
                expect.fail("oninput not accepted in the lab because it does not work with React. Please use onInput. In "+JSON.stringify(tag));
            expect.fail("tag expected to define onChange or onInput native event listener. In "+JSON.stringify(tag));
        }
    }else{ 
        if(!Object.keys(tag.props).includes("onClick")){
            if(Object.keys(tag.props).includes("onclick"))
                expect.fail("onclick not accepted in the lab because it does not work with React. Please use onClick. In "+JSON.stringify(tag));
            expect.fail("tag expected to define onClick native event listener. In "+JSON.stringify(tag));
        }
    }
}

function prepareViewWithCustomEvents(view, props, makeButtons, handlers){
    installOwnCreateElement();
    const rendering= view(props);
    const clickables= makeButtons(rendering);
    let  propNames;
    try{
        propNames=clickables.map(findCustomEventName);
    }catch(e){
        e.message= view.name +": " + e.message;
        throw e;
    }
    const extraProps= propNames.reduce(function(acc, prop, index){
        return {...acc, [prop]:(handlers && handlers[index]) || function(){}};
    }, {});
    const rendering1= view({...props, ...extraProps});
    return { rendering: rendering1, clickables: makeButtons(rendering1), customEventNames:propNames};
}

function allChildren(tree){
    let tags= tree.children?tree.children.flat().map(
        function child2TagsCB(t){
            return allChildren(t);}
    ).flat():[];
    tags=[tree, ...tags];
    return tags;
}

// Returns true if there is a node in nodes whose property property
// which contain a query from queries.
function searchProperty(nodes, property, queries, tag=null, strictEqual = false) {
    function getVal(node){ return property=="textContent"?node.toString():node.tag==tag?node.props[property]:null; }
    
    if (!strictEqual)
        return nodes.some(
            function tw2_3_30_checkNodeCB(node){
                const val= getVal(node);
                return val &&
                    queries.some(function tw2_3_30_checkQueryCB(query){
                        return  val
                            .toLowerCase().includes(query.toString().toLowerCase());
                    });
            });
    else
        return nodes.some(
            function tw2_3_30_checkNodeCB2(node){
                const val= getVal(node); 
                return val &&
                    queries.some(function tw2_3_30_checkQueryCB2(query){return val === query.toString();});
            });
}

export {findTag, allChildren, searchProperty, findCustomEventName, prepareViewWithCustomEvents, onlyAllowNativeEventNames};

    
