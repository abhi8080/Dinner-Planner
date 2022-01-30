import { assert, expect, should } from 'chai';
import dishesConst from './dishesConst.js';

var DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}

describe("TW1.1 DinnerModel", function() {
    this.parent.setMaxListeners(200); // prevent EventEmitter "too many listeners" warning
    this.timeout(200000);  // increase to allow debugging during the test run
    let model;
    
    beforeEach(function() {
        model = new DinnerModel();
    });
    
    it("number of guests can only be set to a positive integer", function(){
        model.setNumberOfGuests(1);
        expect(model.numberOfGuests).to.equal(1);
        model.setNumberOfGuests(2);
        expect(model.numberOfGuests).to.equal(2);
        
        const msg= "number of guests not a positive integer";
        
        expect(function(){model.setNumberOfGuests(-1);}).to.throw(msg);
        expect(function(){model.setNumberOfGuests(0);}).to.throw(msg);
        expect(function(){model.setNumberOfGuests(3.14159265);}).to.throw(msg);
    });

    it("can remove dishes", () => {
        model.addToMenu(getDishDetails(100));
        model.addToMenu(getDishDetails(1));
        model.addToMenu(getDishDetails(200));
        expect(model.dishes.length).to.equal(3);
        
        // dish 1 should be in the menu
        expect(model.dishes).to.include(getDishDetails(1));
        expect(model.dishes).to.include(getDishDetails(100));
        expect(model.dishes).to.include(getDishDetails(200));
        
        model.removeFromMenu({id:1});
            // should now be removed
        expect(model.dishes).to.not.include(getDishDetails(1));
        
        expect(model.dishes.length).to.equal(2);
        expect(model.dishes).to.include(getDishDetails(100));
        expect(model.dishes).to.include(getDishDetails(200));
        
        // remove non-existing dish
        model.removeFromMenu({id:256});
        expect(model.dishes.length).to.equal(2);
        expect(model.dishes).to.include(getDishDetails(100));
        expect(model.dishes).to.include(getDishDetails(200));
    });

    it("can set current dish", function(){
        const oldFetch= fetch;
        window.fetch= function(){
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
