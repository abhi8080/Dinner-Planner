import { assert, expect } from "chai";

const X = TEST_PREFIX;

describe("TW3.3 initial hash", function tw_3_3_40() {
    this.timeout(200000);

    it("Hash should be turned into #search at startup",  function tw3_3_40_1() {
        window.location.hash="blabla";
        try {
        require("/src/views/"+X+"navigation.js").default;
    } catch (e) { }
        expect(window.location.hash, "an unknown hash should be turned into search at startup").to.equal("#search");        
    });
});
