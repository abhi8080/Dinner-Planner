import { expect } from "chai";
import installOwnCreateElement from "./jsxCreateElement";

let promiseNoData;
const X = TEST_PREFIX;
try {
  promiseNoData = require("/src/views/" + X + "promiseNoData.js").default;
} catch (e) { }

describe("TW2.4 promiseNoData", function tw2_4_30() {
  this.timeout(200000);

  before(function tw2_4_30_before() {
    installOwnCreateElement();
    if (!promiseNoData) this.skip();
  });

  it('promiseNoData returns a DIV with "no data" content when promise in the promise state is falsy', async function tw2_4_30_1() {
    const response = promiseNoData({ promise: null });

    expect(response.tag, "promiseNoData must return a div").to.be.equal("div");
    expect(
      response.children.length,
      "expecting DIV to have a single (text) child, must not have extra spaces"
    ).to.equal(1);
    expect(
      response.children[0].toLowerCase(),
      "Does the text say 'no data' in the div"
    ).to.equal("no data");
    expect(response.children[0], "Remember that the NO DATA message should be displayed as a string!").to.be.a("string");
  });

  it("promiseNoData returns an image  when promise is not yet resolved (data and error in promise state are falsy) ", async function tw2_4_30_2() {
    const response = promiseNoData({ promise: "dummy" });

    expect(response.tag, "promiseNoData must have a spinner img").to.be.equal(
      "img"
    );
    expect(
      response.props.src,
      "Must correctly have an image in src"
    ).to.be.a("string");
  });

  it("promiseNoData returns a div with the error text if the error in promise state is truthy", async function tw2_4_30_3() {
    function Error(error) {
      this.error = error;
    }
    Error.prototype.toString = function errorToString() {
      return `${this.error}`;
    };
    
    const error = new Error("dummy error to show");

    const response = promiseNoData({
      promise: "dummy",
      error: error,
    });

    expect(response.children[0], "The error message should be displayed as a string").to.be.a("string");

    expect(response.tag, "Does promiseNoData return a div").to.equal("div");
    expect(
      response.children.length,
      "expecting DIV to have a single (text) child, must not have any extra spaces?"
    ).to.equal(1);
    expect(
      response.children[0],
      "promiseNoData must render the error sent"
    ).to.equal("dummy error to show");
  });

  it("promiseNoData returns falsy when data in promise state is not undefined and promise is truthy", async function tw2_4_30_4() {
    const response = promiseNoData({ promise: "dummy", data: "some data" });
    expect(response, "promiseNoData with promise and data should return falsy").to.be.not.ok;
  });
});
