import { assert, expect } from "chai";

const X = TEST_PREFIX;

describe("TW3.3 initial hash", function () {
    this.timeout(200000);

    it("Hash should be turned into #search at startup",  function() {
        window.location.hash="blabla";        
        require("/src/views/"+X+"navigation.js").default;
        expect(window.location.hash, "an unknown hash should be turned into search at startup").to.equal("#search");        
    });
});
