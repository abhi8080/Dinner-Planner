const { assert, expect } = require("chai");
import {withMyFetch, checkFetchUrl, myDetailsFetch} from "./mockFetch.js";

let getDishDetails;
const X = TEST_PREFIX;
try {
  const dishSource = require("../src/" + X + "dishSource.js");
  if (dishSource.getDishDetails) getDishDetails = dishSource.getDishDetails;
  else getDishDetails = dishSource.default.getDishDetails;
} catch (e) { }


describe("TW2.2 getDishDetails", function tw2_2_10() {
  this.timeout(200000);

  before(function  tw2_2_10_before() {
    if (!getDishDetails) this.skip();
  });

    function testPromise(text, p, expectedIdAndHash) {
        it(text, async function tw2_2_10_testPromise(){
            const dish= await withMyFetch(myDetailsFetch, p);
            expect(dish, "getDishDetails expected to return Promise").to.be.ok;
            expect(dish.id, "getDishDetails expected to return a dish with the given id").to.equal(expectedIdAndHash.id);
            checkFetchUrl(myDetailsFetch.lastFetch, myDetailsFetch.lastParam, [expectedIdAndHash.hash]);
        }).timeout(4000);
    }
    
    testPromise("getDishDetails promise #1",  function tw2_2_10_testPromise1(){return getDishDetails(1445969);}, {
        id: 1445969,
        hash:  -1407095300
    });
    
    
    testPromise("getDishDetails promise #2", function tw2_2_10_testPromise2(){return  getDishDetails(601651);}, {
        id: 601651,
        hash: 105207665
    });
    
    it("getDishDetails promise must reject if the dish with the given ID does not exist", async function tw2_2_10_3(){
        let error;
        let fetchErr;
        try{
            await withMyFetch(function myFetch(url, param){
                try{
                    checkFetchUrl(url, param, [1439408948, ]);
                }catch(e){
                    fetchErr=e;
                }
                if(!fetchErr)
                    return  Promise.resolve({
                        ok:false,
                        status:404,
                        json(){
                            return Promise.resolve({ msg: "dummy error dish not found"});
                        }
                    });
                else return Promise.resolve({
                    ok:true,
                    status:200,
                    json(){
                        return Promise.resolve({ id:-1});
                    }
                });
            },
                              function returnPromise(){
                                  return getDishDetails(undefined);
                              }
                             );
        }catch (e) {
            error=e;
        }
        if(fetchErr)
            throw fetchErr;
        expect(error, "getDishDetails(bad_param) must reject").to.be.ok;
    }).timeout(4000);
});
