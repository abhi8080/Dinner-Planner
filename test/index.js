// https://survivejs.com/webpack/techniques/testing/
if (module.hot) {
  const context = require.context(
    "mocha-loader!./", // Process through mocha-loader
    false, // Skip recursive processing
    /\.test.js$/ // Pick only files ending with .test.js
  );
  context.keys().forEach(context);
}

const backendURL = "http://standup.eecs.kth.se:3000/";
// fetch is overriden somewhere in the tests...
const normalFetch = window.fetch;

class TestAnalyzer {
  // mochaTestSuites is the default structure
  // in the mocha test runner (this.suite.suites)
  constructor(mochaTestSuites) {
    // a list of all test suites
    this.allSuites = [];
    // a list of all test suites that have been completed
    this.completedSuites = [];

    mochaTestSuites.forEach((suite) => {
      // if one of the tests has a state, the suite is complete
      let isCompletedSuite = suite.tests.some(
        (test) => test.state && test.state !== "pending"
      );

      // cleaning up the tests from mocha
      let suiteTests = suite.tests.map((test) => ({
        name: test.title,
        state: test.state,
        error: test.err ? test.err.message : null,
      }));

      suiteTests = suiteTests.filter((test) => test.state !== "pending");

      // cleaning up the suite from mocha
      let cleanSuite = {
        name: suite.title,
        tests: suiteTests,
      };

      // pushing to correct suite arrays
      this.allSuites.push(cleanSuite);
      if (isCompletedSuite) this.completedSuites.push(cleanSuite);
    });
  }

  formatAndPostTestResults() {
    // generate a mapping between an ID and a suite name
    // to save bandwidth
    let suiteToID = {};
    let IDtoSuite = {};

    this.completedSuites.forEach((suite, index) => {
      suiteToID[suite.name] = index;
      IDtoSuite[index] = suite.name;
    });

    // put all tests in a single array
    let tests = [];
    this.completedSuites.forEach((suite) => {
      suite.tests.forEach((test) => {
        tests.push({
          name: test.name,
          state: test.state,
          error: test.error,
          suiteID: suiteToID[suite.name],
        });
      });
    });

    // include username, suite mapping and completed tests
    // username from webpack DefinePlugin
    let body = {
      username: TELEMETRY === "full" && USERNAME ? USERNAME : "anonymous",
      semester: SEMESTER ? SEMESTER : "unknown",
      suiteIDMapping: IDtoSuite,
      tests: tests,
    };

    // POST data to backend server
    if (TELEMETRY !== "none") this.postData(body);
  }

  postData(data) {
    // has to have content type application/json header
    // to be accepted by the backend server
    normalFetch(backendURL, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}

// extend the default mocha runner to
// post test results to backend after the tests are completed
const runnerClass = mocha._runnerClass;

class MyRunner extends runnerClass {
  constructor(suite, opts) {
    super(suite, opts);
  }
  runAsync(...params) {
    return super.runAsync(...params).then((result) => {
      let testanalyzer = new TestAnalyzer(this.suite.suites);
      testanalyzer.formatAndPostTestResults();
      return result;
    });
  }
}

mocha._runnerClass = MyRunner;
