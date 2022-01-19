import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
let utils={};
try{
     utils= require('../src/'+TEST_PREFIX+'utilities.js');
}catch(e){}
const {isKnownTypeCB, dishType}=utils;

describe("TW1.1 dishType", function() {
    this.parent.setMaxListeners(200); // prevent EventEmitter "too many listeners" warning

    this.timeout(200000);  // increase to allow debugging during the test run

    before(function(){
        if(!isKnownTypeCB)this.skip();
    });

    it("knownTypeCB recognizes only starter, main course, dessert", function(){
        assert.equal(isKnownTypeCB("starter"), true);
        assert.equal(isKnownTypeCB("main course"), true);
        assert.equal(isKnownTypeCB("dessert"), true);
        assert.equal(isKnownTypeCB("appetizer"), false);
    });
    
    it("dishType returns a known dish type", function(){ assert.equal(dishType(dishesConst[4]), "main course");});
    //    it("should recognize starter in first position", function(){ return assert.equal(dishType(dishesConst[1]), "starter");});
    //    it("should recognize starter in other position", function(){ return assert.equal(dishType(dishesConst[2]), "starter");});
    //    it("should recognize dessert in first position", function(){ return assert.equal(dishType(dishesConst[6]), "dessert");});
    //    it("should recognize dessert in other position", function(){ return assert.equal(dishType(dishesConst[5]), "dessert");});
    it("dishType returns empty string if starter, main course, dessert not present", function(){ assert.equal(dishType(dishesConst[0]), "");});
    it("dishType returns empty string if dishTypes property not present", function(){ assert.equal(dishType(dishesConst[7]), "");});
});

