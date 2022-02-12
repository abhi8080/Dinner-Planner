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

function findCustomEventName(tag){
    let propName;
    try{
        if(tag.props.onChange || tag.props.onInput){
            (tag.props.onChange || tag.props.onInput)({target:{value:"dummy"}});
        }
        else if(tag.props.onClick)
            tag.props.onClick();

    }catch(e){
        let msg=e.message;
        expect(e.message).to.include(" is not a function");
        propName=e.message.replace(" is not a function", "");
        // remove props.  before the function name, if any
        propName= propName.replace(/^[$A-Z_][0-9A-Z_$]*\./i, "");
    }
    expect(propName, "expected  "+tag+ "to invoke a callback prop (fire custom event)").to.be.ok;
    return propName;
}

function prepareViewWithCustomEvents(view, props, makeButtons, handlers){
    installOwnCreateElement();
    const rendering= view(props);
    const clickables= makeButtons(rendering);

    const propNames=clickables.map(findCustomEventName);
    const extraProps= propNames.reduce(function(acc, prop, index){
        return {...acc, [prop]:(handlers && handlers[index]) || function(){}};
    }, {});
    const rendering1= view({...props, ...extraProps});
    return { rendering: rendering1, clickables: makeButtons(rendering1)};
}

export {findTag, findCustomEventName, prepareViewWithCustomEvents};

