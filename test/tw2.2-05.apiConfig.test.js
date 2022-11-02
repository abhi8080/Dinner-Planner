import { expect } from "chai";

let apiConfig;
const X = TEST_PREFIX;
try {
  apiConfig = require("../src/" + X + "apiConfig.js");
} catch (e) { }

describe("TW2.2 apiConfig", function tw2_2_05() {
  before(function tw2_2_05_before() {
    if (!apiConfig) this.skip();
  });

  it("apiConfig exports BASE_URL and API_KEY", function tw2_2_05_1() {
    expect(apiConfig.BASE_URL, "BASE_URL not found in src/apiConfig.js").to.not
      .be.undefined;
    expect(apiConfig.API_KEY, "API_key not found in src/apiConfig.js").to.not.be
      .undefined;
    expect(apiConfig.BASE_URL, "BASE_URL is not a string").to.be.a("string");
    expect(apiConfig.API_KEY, "API_KEY is not a string").to.be.a("string");
  });

  let urlRegex = /^https\:\/\/brfenergi\.se\/iprog\/group\/[0-9]/;
  it("Check BASE_URL is correct", function tw2_2_05_2() {
    expect(
      apiConfig.BASE_URL,
      "BASE_URL does not follow the format indicated"
    ).to.match(urlRegex);
  });

  it("Check length of API_KEY", function tw2_2_05_3() {
    expect(
      apiConfig.API_KEY,
      "API_KEY does not have a length of 50. Verify the API_Key is correct"
    ).to.have.lengthOf(50); // API_KEY has len 50
  });
});
