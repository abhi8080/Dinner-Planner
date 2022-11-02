import { assert, expect } from "chai";
import {findKeys} from "./mockFirebase.js";
import {withMyFetch, myDetailsFetch, dishInformation} from "./mockFetch.js";
import {dummyImgName} from "./searchUtils.js";

async function checkImageAndProps(doRender, propsHistory){
    const {numberKey, dishesKey, currentDishKey, num, dishes, currentDish}= await findKeys();
    window.firebase.firebaseDataForOnce={
        [num]:5,
        [dishes]:{
            "11":"bla",
            "16":"blabla",
            "13":"some dish"
        },
        [currentDish]:42,
    };
    const oldFetch= fetch;
    window.fetch= myDetailsFetch;
    
    try{
        doRender();
        await new Promise(resolve => setTimeout(resolve));
    }
    finally{ window.fetch=oldFetch; }

    expect(propsHistory.length, "Root should initially render an image").to.gte(1);
    expect(propsHistory[0], "Root should initially render an image").to.equal(dummyImgName);
    expect(propsHistory[1], "Root should pass a model prop to App").to.have.property("model");
    //expect(propsHistory[1].model, "App model prop should be an object from VueRoot state (proxy)").to.be.a("Proxy");
    expect(propsHistory[1].model.numberOfGuests, "model passed to App  should have the same number of guests as in firebase").to.equal(5);
    expect(propsHistory[1].model.dishes.map(d=>d.id).sort(), "model passed to App passed should have the same dish IDs as in firebase").to.eql([11,13,16]);
}

async function checkUpdateFromFirebase(propsHistory){
    const {numberKey, dishesKey, currentDishKey, num, dishes, currentDish}= await findKeys();

    propsHistory.length=0;    
    const guestEvent= window.firebase.firebaseEvents.value[numberKey];
    guestEvent({val(){ return 7;}});
    
    await new Promise(resolve => setTimeout(resolve));

    expect(propsHistory.length, "Changing nr of guests in firebase should update the root children").to.gte(1);
    expect(propsHistory[0].model.numberOfGuests, "Changing nr of guests in firebase should update the root children with the new value").to.equal(7);

    propsHistory.length=0;    
    const addedEvent=  window.firebase.firebaseEvents.child_added[dishesKey];
    await withMyFetch(myDetailsFetch, function(){addedEvent({key:"3214", val(){ return "blabla";}});});

    expect(propsHistory.length, "Adding a dish in firebase should update the root children").to.gte(1);
    expect(propsHistory[0].model.dishes.map(d=>d.id).sort(), "Adding a dish in firebase should update the root children with the new dish array").to.eql([11, 13, 16, 3214]);

    propsHistory.length=0;    
    const removedEvent= window.firebase.firebaseEvents.child_removed[dishesKey];
    removedEvent({key:"11", val(){ return "blabla";}});
    
    await new Promise(resolve => setTimeout(resolve));
    expect(propsHistory.length, "Removing a dish in firebase should update the root children").to.gte(1);
    expect(propsHistory[0].model.dishes.map(d=>d.id).sort(), "Removing a dish in firebase should update the root children with the new dish array").to.eql([13, 16, 3214]);

}

async function checkFirebaseUpdate(propsHistory){
    const {numberKey, dishesKey, currentDishKey, num, dishes, currentDish}= await findKeys();
    
    propsHistory.slice(-1)[0].model.setNumberOfGuests(13);
    expect(window.firebase.firebaseData[numberKey], "changing the model passed to App should update firebase").to.equal(13);
}

export {checkImageAndProps, checkUpdateFromFirebase, checkFirebaseUpdate};
