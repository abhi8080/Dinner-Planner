import { assert, expect } from "chai";

import {withMyFetch, myDetailsFetch, dishInformation} from "./mockFetch.js";

let firebaseModel;

let firebaseData={};

const firebaseEvents={
    value:{},
    child_added:{},
    child_removed:{},
};

let firebaseRoot;
let firebaseDataForOnce;
window.firebase={
    initializeApp(){},
    database(){
        return {
            ref(x){
                if(x.slice(-1)=="/")
                    x=x.slice(0, -1); 
                return {
                    set(value){firebaseData[x]= value;},
                    on(event,f){firebaseEvents[event][x]= f;},
                    once(event,f){
                        firebaseRoot=x;
                        expect(firebaseDataForOnce, "once is only supposed to be used for the initial promise").to.be.ok;
                        return Promise.resolve({
                            key:x,
                            val(){ return firebaseDataForOnce;}
                        });
                    },
                };
            }
        };
    }
};

async function findKeys(){
    firebaseData={};
    const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

    const model= new DinnerModel();
    firebaseModel.updateFirebaseFromModel(model);
    model.setNumberOfGuests(3);
    const numberKey= Object.keys(firebaseData)[0];
    
    firebaseData={};
    await withMyFetch(myDetailsFetch, function(){ model.setCurrentDish(8);});
    const currentDishKey= Object.keys(firebaseData)[0];
    
    firebaseData={};
    model.addToMenu(dishInformation);
    const dishesKey= Object.keys(firebaseData)[0].replace("/1445969", "");
    
    return {numberKey, currentDishKey, dishesKey};
}
const X = TEST_PREFIX;
try {
  firebaseModel = require("../src/" + X + "firebaseModel.js");
} catch (e) {console.log(e);}

describe("TW3.5 Firebase-model", function tw3_5_10() {
    this.timeout(200000); // increase to allow debugging during the test run
    
    before(function () {
        if (!firebaseModel) this.skip();
    });
    it("model saved to firebase", async function tw3_5_10_1() {
        const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;
        firebaseData={};        
        const model= new DinnerModel();
        
        firebaseModel.updateFirebaseFromModel(model);

        expect(firebaseData, "no data should be set in firebase by updateFirebaseFromModel").to.be.empty;

        model.setNumberOfGuests(5);
        let data= Object.values(firebaseData);
        expect(data.length, "setting number of guests should set a single firebase property").to.equal(1);
        expect(data[0], "number of guests saved correctly").to.equal(5);
        const numberKey=Object.keys(firebaseData)[0];

        firebaseData={};
        model.setNumberOfGuests(5);
        expect(firebaseData, "no data should be set in firebase if number of guests is set to its existing value ").to.be.empty;

        firebaseData={};        
        await withMyFetch(myDetailsFetch, function(){ model.setCurrentDish(7);});
        
        data= Object.values(firebaseData);
        expect(data.length, "setting current dish should set a single firebase property").to.equal(1);
        expect(data[0], "current dish id saved correctly").to.equal(7);
        const currentDishKey=Object.keys(firebaseData)[0];
        expect(currentDishKey, "firebase paths for number of guests and current dish must be different").to.not.equal(numberKey); 
        
        firebaseData={};
        myDetailsFetch.lastFetch=undefined;
        await withMyFetch(myDetailsFetch, function(){ model.setCurrentDish(7);});

        expect(myDetailsFetch.lastFetch, "no fetch expected if currentDish is set to its existing value").to.not.be.ok;
        expect(firebaseData, "no data should be set in firebase if currentDish is set to its existing value ").to.be.empty;
        
        firebaseData={};
        model.addToMenu(dishInformation);
        data= Object.keys(firebaseData);
        expect(data.length, "adding a dish should set a single firebase property").to.equal(1);
        let numbers= data[0].match(/\d+$/);
        expect(numbers[numbers.length-1], "the firebase path for an added dish must end with the dish id as string").to.equal("1445969");
        expect(data[0].endsWith(numbers[numbers.length-1]), "the firebase path for an added dish must end with the dish id as string").to.be.true;
        expect(Object.values(firebaseData)[0], "the object saved in firebase for an added dish must be truthy").to.be.ok;

        firebaseData={};
        model.addToMenu(dishInformation);
        expect(firebaseData, "adding a dish that is already in the menu should not change firebase").to.be.empty;

        firebaseData={};
        model.removeFromMenu(dishInformation);
        data= Object.keys(firebaseData);
        expect(data.length, "removing a dish should set a single firebase property").to.equal(1);
        numbers= data[0].match(/\d+$/);
        expect(numbers[numbers.length-1], "the firebase path for a removed dish must end with the dish id as string").to.equal("1445969");
        expect(data[0].endsWith(numbers[numbers.length-1]), "the firebase path for a removed dish must end with the dish id as string").to.be.true;
        expect(Object.values(firebaseData)[0], "removing a dish should remove an object from firebase by setting null on its path").to.not.be.ok;
        firebaseData={};
        model.removeFromMenu(dishInformation);
        expect(firebaseData, "removing a dish that is not in the menu should not change firebase").to.be.empty;
    });

    it("model read from firebase", async function tw3_5_10_2() {
        const {numberKey, dishesKey, currentDishKey}= await findKeys();

        let nguests, currentDish, dishAdded, dishRemoved;
        const mockModel={
            dishes:[],
            setNumberOfGuests(x){ nguests=x;} ,
            setCurrentDish(x){ currentDish=x;} ,
            addToMenu(x){ dishAdded=x;} ,
            removeFromMenu(x){ dishRemoved=x;} ,
        };
        
        firebaseModel.updateModelFromFirebase(mockModel);
        
        expect(Object.keys(firebaseEvents.value).length, "two value listeners are needed: number of guests and current dish").to.equal(2);

        const guestEvent= firebaseEvents.value[numberKey];
        expect(guestEvent, "there should be an on() value listener for the number of guests").to.be.ok;

        const currentEvent= firebaseEvents.value[currentDishKey]; 
        expect(currentEvent, "there should be an on() value listener for the current dish").to.be.ok;

        
        expect(Object.keys(firebaseEvents.child_added).length, "one child_added listener is needed").to.equal(1);
        const addedEvent= firebaseEvents.child_added[dishesKey];
        expect(addedEvent, "there should be an on() child added listener for the dishes").to.be.ok;
        
        expect(Object.keys(firebaseEvents.child_removed).length, "one child_removed listener is needed").to.equal(1);
        const removedEvent= firebaseEvents.child_removed[dishesKey];
        expect(removedEvent, "there should be an on() child removed listener for the dishes").to.be.ok;

        guestEvent({val(){ return 7;}});
        expect(nguests, "callback passed to on() value listener for number of guests should change the number of guests").to.equal(7);

        currentEvent({val(){ return 8;}});
        expect(currentDish, "callback passed to on() value listener for current dish should change the current dish").to.equal(8);
        
        myDetailsFetch.lastFetch=undefined;
        await withMyFetch(myDetailsFetch, function(){addedEvent({key:"3214", val(){ return "blabla";}});});

        expect(myDetailsFetch.lastFetch, "a child added event should initiate a promise to retrieve the dish").to.be.ok;
        expect(dishAdded, "a child added event should add a dish if it does not exist already").to.be.ok;
        expect(dishAdded.id, "a child added event should add a dish with the given key it does not exist already").to.equal(3214);

        mockModel.dishes=[dishAdded];
        dishAdded=undefined;
        myDetailsFetch.lastFetch=undefined;
        await withMyFetch(myDetailsFetch, function(){addedEvent({key:"3214", val(){ return "blabla";}});});

        expect(myDetailsFetch.lastFetch, "a child added event should not initiate a promise if the dish is already in the menu").to.not.be.ok;
        expect(dishAdded, "a child added event should not add a dish if it is already in the menu").to.not.be.ok;

        removedEvent({key:"3214", val(){ return "blabla";}});
        expect(dishRemoved, "a child removed event should remove the dish from the menu").to.be.ok;
    });

    it("model firebase promise", async function tw3_5_10_3() {
        const {numberKey, dishesKey, currentDishKey}= await findKeys();
        const root= longestCommonPrefix([numberKey, dishesKey, currentDishKey]);
        const num= numberKey.slice(root.length);
        const dishes= dishesKey.slice(root.length);
        const currentDish= currentDishKey.slice(root.length);
        
        firebaseDataForOnce={
            [num]:7,
            [dishes]:{
                "12":"bla",
                "15":"blabla",
                "14":"some dish"
            },
            [currentDish]:42,
        };
        const oldFetch= fetch;
        window.fetch= myDetailsFetch;
        let model;
        try{
            model= await firebaseModel.firebaseModelPromise();
        }
        finally{ window.fetch=oldFetch; }
        expect(model, "promise should resolve to a model").to.be.ok;
        expect(model.constructor.name, "promise should resolve to a model").to.equal("DinnerModel");
        expect(firebaseRoot, "once should be attached on the firebase model root path").to.equal(root.slice(0,-1));
        expect(model.numberOfGuests, "initial model should read number of guests from firebase").to.equal(7);
        expect(model.dishes, "initial model should read dishes from firebase").to.be.ok;
        expect(model.dishes.length, "initial model should read from firebase the same number of dishes").to.equal(3);
        expect(model.dishes.map(d=>d.id).sort().join(","), "initial model should read from firebase the same dishes").to.equal("12,14,15");
        expect(model.currentDish, "initial model should not include current dish").to.not.be.ok;
    });
});

function longestCommonPrefix(strs) {
    if (strs === undefined || strs.length === 0) { return ''; }
    
    return strs.reduce((prev, next) => {
        let i = 0;
        while (prev[i] && next[i] && prev[i] === next[i]) i++;
        return prev.slice(0, i);
    });
};

