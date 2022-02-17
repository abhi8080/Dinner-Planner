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
    propNames.forEach(function checkPropCB(prop){
        if(Object.keys(tag.props).includes(prop) && !tag.props[prop])
            expect.fail("Please define a named function for event listener "+prop +" of element "+JSON.stringify(tag)+".\nThis is a limitation of the tests but it will not be fixed since the course code convention is to provide named callbacks.");
    });
    try{
        if(tag.props.onChange || tag.props.onInput){
            (tag.props.onChange || tag.props.onInput)({target:{value:"dummy"}});
        }
        else if(tag.props.onClick)
            tag.props.onClick();
        
    }catch(e){
        let msg=e.message;
        expect(e.message).to.include(" is not a function");
        propName=e.message.match( /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\s+is not a function/)[0].replace(" is not a function", "");
    }
    expect(propName, "expected  "+ JSON.stringify(tag)  +"to invoke a callback prop (fire custom event)").to.be.ok;
    return propName;
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

export {findTag, findCustomEventName, prepareViewWithCustomEvents};

