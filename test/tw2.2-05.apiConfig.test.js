import { expect } from 'chai';

let apiConfig = '';
const X = TEST_PREFIX;
try {
  apiConfig = require('../src/' + X + 'apiConfig.js');
} catch (e) {}

const { BASE_URL, API_KEY } = apiConfig;

describe('TW2.2 apiConfig', function () {
  before(function () {
    if (!apiConfig) this.skip();
  });

  it('apiConfig exports BASE_URL and API_KEY', function () {
    expect(BASE_URL).to.not.be.undefined;
    expect(API_KEY).to.not.be.undefined;
    expect(BASE_URL).to.be.a('string');
    expect(API_KEY).to.be.a('string');
  });
});
