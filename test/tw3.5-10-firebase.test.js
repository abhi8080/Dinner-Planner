import { assert, expect } from "chai";

import {withMyFetch, myDetailsFetch, dishInformation} from "./mockFetch.js";

import {findKeys, longestCommonPrefix} from "./mockFirebase.js";

let firebaseModel;

const X = TEST_PREFIX;
try {
  firebaseModel = require("../src/" + X + "firebaseModel.js");
} catch (e) {console.log(e);}

describe("TW3.5 Firebase-model", function tw3_5_10() {
    this.timeout(200000); // increase to allow debugging during the test run
    
    before(function tw3_5_10_before() {
        if (!firebaseModel) this.skip();
    });

        it("observerRecap should add an observer", function tw3_5_10_1() {
            let observerAdded;
            firebaseModel.observerRecap({ addObserver(o){  observerAdded=o; }});
            expect(observerAdded, "observerRecap must add an observer").to.be.ok;
            expect(observerAdded, "observerRecap must be a function").to.be.a("function");
        });

        it("observerRecap should print the payload", function tw3_5_10_2() {
            let observerAdded;
            firebaseModel.observerRecap({ addObserver(o){  observerAdded=o; }});
            const oldConsole= console;
            let wasLogged;
            const someObject= {test:"value"};
            window.console= { log(x){ wasLogged=x; } } ;
            try{
                observerAdded(someObject); 
            }finally{  window.console=oldConsole; }
            expect(wasLogged,"observerRecap must console.log the payload").to.equal(someObject);
        });

        it("observerRecap prints DinnerModel payloads, examine them on your Console!", async function tw3_5_10_1() {
            const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;
            const model= new DinnerModel();
            
            firebaseModel.observerRecap(model);
            expect(model.observers.length, "observerRecap should add exactly one observer to the model").to.be.equal(1);
        
            model.setNumberOfGuests(5);
            await withMyFetch(myDetailsFetch, ()=>model.setCurrentDish(1));
            model.addToMenu({id: 1, title: "dish1"});
            model.removeFromMenu( {id: 1, title: "dish1"});
        });

    it("model saved to firebase", async function tw3_5_10_1() {
        const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;
        window.firebase.firebaseData={};        
        const model= new DinnerModel();
        
        firebaseModel.updateFirebaseFromModel(model);

        expect(window.firebase.firebaseData, "no data should be set in firebase by updateFirebaseFromModel").to.be.empty;

        model.setNumberOfGuests(5);
        expect(window.firebase.emptyRef, "empty firebase ref used during execution of setNumberOfGuests").to.not.be.ok;
        
        let data= Object.values(window.firebase.firebaseData);
        expect(data.length, "setting number of guests should set a single firebase property").to.equal(1);
        expect(data[0], "number of guests saved correctly").to.equal(5);
        const numberKey=Object.keys(window.firebase.firebaseData)[0];

        window.firebase.firebaseData={};
        model.setNumberOfGuests(5);
        expect(window.firebase.firebaseData, "no data should be set in firebase if number of guests is set to its existing value ").to.be.empty;

        window.firebase.firebaseData={};        
        await withMyFetch(myDetailsFetch, function(){ model.setCurrentDish(7);});
        expect(window.firebase.emptyRef, "empty firebase ref used during execution of setCurrentDish").to.not.be.ok;

        data= Object.values(window.firebase.firebaseData);
        expect(data.length, "setting current dish should set a single firebase property").to.equal(1);
        expect(data[0], "current dish id saved correctly").to.equal(7);
        const currentDishKey=Object.keys(window.firebase.firebaseData)[0];
        expect(currentDishKey, "firebase paths for number of guests and current dish must be different").to.not.equal(numberKey); 
        
        window.firebase.firebaseData={};
        myDetailsFetch.lastFetch=undefined;
        await withMyFetch(myDetailsFetch, function(){ model.setCurrentDish(7);});

        expect(window.firebase.emptyRef, "empty firebase ref used during execution of setCurrentDish").to.not.be.ok;
        expect(myDetailsFetch.lastFetch, "no fetch expected if currentDish is set to its existing value").to.not.be.ok;
        expect(window.firebase.firebaseData, "no data should be set in firebase if currentDish is set to its existing value ").to.be.empty;
        
        window.firebase.firebaseData={};
        model.addToMenu(dishInformation);

        expect(window.firebase.emptyRef, "empty firebase ref used during execution of addToMenu").to.not.be.ok;
        data= Object.keys(window.firebase.firebaseData);
        expect(data.length, "adding a dish should set a single firebase property").to.equal(1);
        let numbers= data[0].match(/\d+$/);
        expect(numbers[numbers.length-1], "the firebase path for an added dish must end with the dish id as string").to.equal("1445969");
        expect(data[0].endsWith(numbers[numbers.length-1]), "the firebase path for an added dish must end with the dish id as string").to.be.true;
        expect(Object.values(window.firebase.firebaseData)[0], "the object saved in firebase for an added dish must be truthy").to.be.ok;

        window.firebase.firebaseData={};
        model.addToMenu(dishInformation);
        expect(window.firebase.firebaseData, "adding a dish that is already in the menu should not change firebase").to.be.empty;

        window.firebase.firebaseData={};
        model.removeFromMenu(dishInformation);

        expect(window.firebase.emptyRef, "empty firebase ref used during execution of removeFromMenu").to.not.be.ok;
        data= Object.keys(window.firebase.firebaseData);
        expect(data.length, "removing a dish should set a single firebase property").to.equal(1);
        numbers= data[0].match(/\d+$/);
        expect(numbers[numbers.length-1], "the firebase path for a removed dish must end with the dish id as string").to.equal("1445969");
        expect(data[0].endsWith(numbers[numbers.length-1]), "the firebase path for a removed dish must end with the dish id as string").to.be.true;
        expect(Object.values(window.firebase.firebaseData)[0], "removing a dish should remove an object from firebase by setting null on its path").to.not.be.ok;
        window.firebase.firebaseData={};
        model.removeFromMenu(dishInformation);
        expect(window.firebase.firebaseData, "removing a dish that is not in the menu should not change firebase").to.be.empty;
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
        expect(window.firebase.emptyRef, "empty firebase ref used in updateModelFromFirebase").to.not.be.ok;
        
        expect(Object.keys(window.firebase.firebaseEvents.value).length, "two value listeners are needed: number of guests and current dish").to.equal(2);

        const guestEvent= window.firebase.firebaseEvents.value[numberKey];
        expect(guestEvent, "there should be an on() value listener for the number of guests").to.be.ok;

        const currentEvent= window.firebase.firebaseEvents.value[currentDishKey]; 
        expect(currentEvent, "there should be an on() value listener for the current dish").to.be.ok;

        
        expect(Object.keys(window.firebase.firebaseEvents.child_added).length, "one child_added listener is needed").to.equal(1);
        const addedEvent= window.firebase.firebaseEvents.child_added[dishesKey];
        expect(addedEvent, "there should be an on() child added listener for the dishes").to.be.ok;
        
        expect(Object.keys(window.firebase.firebaseEvents.child_removed).length, "one child_removed listener is needed").to.equal(1);
        const removedEvent= window.firebase.firebaseEvents.child_removed[dishesKey];
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
        const {numberKey, dishesKey, currentDishKey, num, dishes, currentDish, root}= await findKeys();
        
        window.firebase.firebaseDataForOnce={
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
        expect(window.firebase.emptyRef, "empty firebase ref used when setting up firebase promise").to.not.be.ok;
        expect(model, "promise should resolve to a model").to.be.ok;
        expect(model.constructor.name, "promise should resolve to a model").to.equal("DinnerModel");
        expect(window.firebase.firebaseRoot, "once should be attached on the firebase model root path").to.equal(root.slice(0,-1));
        expect(model.numberOfGuests, "initial model should read number of guests from firebase").to.equal(7);
        expect(model.dishes, "initial model should read dishes from firebase").to.be.ok;
        expect(model.dishes.length, "initial model should read from firebase the same number of dishes").to.equal(3);
        expect(model.dishes.map(d=>d.id).sort().join(","), "initial model should read from firebase the same dishes").to.equal("12,14,15");
        expect(model.currentDish, "initial model should not include current dish").to.not.be.ok;
    });

    it("model firebase promise with empty database", async function tw3_5_10_4() {
        const {numberKey, dishesKey, currentDishKey, num, dishes, currentDish, root}= await findKeys();

        // test that the code is resilient when the database has not been created yet
        window.firebase.firebaseDataForOnce= undefined;
        const oldFetch= fetch;
        window.fetch= myDetailsFetch;
        let model;
        try{
            model= await firebaseModel.firebaseModelPromise();
        }
        finally{ window.fetch=oldFetch; }
        expect(model, "promise should resolve to a model").to.be.ok;
        expect(model.constructor.name, "promise should resolve to a model").to.equal("DinnerModel");
        expect(window.firebase.firebaseRoot, "once should be attached on the firebase model root path").to.equal(root.slice(0,-1));
        expect(model.numberOfGuests, "initial model should have 2 guests on empty firebase database").to.equal(2);
        expect(model.dishes, "initial model should have empty dishes on empty firebase database").to.be.ok;
        expect(model.dishes.length,  "initial model should have empty dishes on empty firebase database").to.equal(0);
        expect(model.currentDish, "initial model should not include current dish").to.not.be.ok;

        // test that the code is resilient when the database contains no guests or (more importantly) no dishes 
        window.firebase.firebaseDataForOnce= {};
        window.fetch= myDetailsFetch;
        model= undefined;
        try{
            model= await firebaseModel.firebaseModelPromise();
        }
        finally{ window.fetch=oldFetch; }
        expect(model, "promise should resolve to a model").to.be.ok;
        expect(model.constructor.name, "promise should resolve to a model").to.equal("DinnerModel");
        expect(window.firebase.firebaseRoot, "once should be attached on the firebase model root path").to.equal(root.slice(0,-1));
        expect(model.numberOfGuests, "initial model should have 2 guests on empty firebase database").to.equal(2);
        expect(model.dishes, "initial model should have empty dishes on empty firebase database").to.be.ok;
        expect(model.dishes.length,  "initial model should have empty dishes on empty firebase database").to.equal(0);
        expect(model.currentDish, "initial model should not include current dish").to.not.be.ok;
   });
});





