import { assert, expect, should } from 'chai';
import dishesConst from './dishesConst.js';

function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}

describe("TW1.1 DinnerModel", function tw1_1_05() {
    this.parent.setMaxListeners(200); // prevent EventEmitter "too many listeners" warning
    this.timeout(200000);  // increase to allow debugging during the test run
    let model;
    
    beforeEach(function  tw1_1_05_beforeEach() {
        const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;
        model = new DinnerModel();
    });
    
    it("number of guests can only be set to a positive integer", function  tw1_1_05_1(){
        model.setNumberOfGuests(1);
        expect(model.numberOfGuests, "The models numberOfGuests must be set to 1 if setNumberOfGuests(1) is called").to.equal(1);
        model.setNumberOfGuests(2);
        expect(model.numberOfGuests, "The models numberOfGuests must be set to 1 if setNumberOfGuests(1) is called").to.equal(2);
        
        const msg= "number of guests not a positive integer";
        
        expect(function tw1_1_05_1_throw1(){model.setNumberOfGuests(-1);}, "The model should not allow a negative number of guests").to.throw(msg);
        expect(function tw1_1_05_1_throw2(){model.setNumberOfGuests(0);}, "The model should not allow 0 guests").to.throw(msg);
        expect(function tw1_1_05_1_throw3(){model.setNumberOfGuests(3.14159265);}, "The model should not allow a non-integer number of guests").to.throw(msg);
    });

    it("can remove dishes", function  tw1_1_05_2(){
        model.addToMenu(getDishDetails(100));
        model.addToMenu(getDishDetails(1));
        model.addToMenu(getDishDetails(200));
        expect(model.dishes.length, "After adding 3 dishes to the model via addToMenu, the model should have 3 dishes").to.equal(3);
        
        // dish 1 should be in the menu
        expect(model.dishes).to.include(getDishDetails(1));
        expect(model.dishes).to.include(getDishDetails(100));
        expect(model.dishes).to.include(getDishDetails(200));
        
        model.removeFromMenu({id:1});
            // should now be removed
        expect(model.dishes, "The model properly removes dish when given {id:1} as an argument").to.not.include(getDishDetails(1));
        
        expect(model.dishes.length).to.equal(2);
        expect(model.dishes).to.include(getDishDetails(100));
        expect(model.dishes).to.include(getDishDetails(200));
        
        // remove non-existing dish
        model.removeFromMenu({id:256});
        expect(model.dishes.length, "The model should not remove dishes that do not exist").to.equal(2);
        expect(model.dishes).to.include(getDishDetails(100));
        expect(model.dishes).to.include(getDishDetails(200));
    });

    it("can set current dish", function  tw1_1_05_3(){
        const oldFetch= fetch;
        window.fetch= function tw1_1_05_3_fetch(){
            return Promise.resolve({
                ok:true,
                status:200,
                json(){
                    return Promise.resolve(dishesConst[0]);
                }
            });
        };
        try{
            model.setCurrentDish(1);
            expect(model.currentDish).to.equal(1);
            
            model.setCurrentDish(3);
            expect(model.currentDish).to.equal(3);
        }finally{
            window.fetch=oldFetch;
        }
    });
});
