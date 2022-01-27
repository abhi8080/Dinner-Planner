import { expect } from 'chai';

let apiConfig = '';
const X = TEST_PREFIX;
try {
  apiConfig = require('../src/' + X + 'apiConfig.js');
} catch (e) {}

describe('TW2.2 apiConfig', function () {
  before(function () {
    if (!apiConfig) this.skip();
  });

  it('apiConfig exports BASE_URL and API_KEY', function () {
    expect(apiConfig.BASE_URL).to.not.be.undefined;
    expect(apiConfig.API_KEY).to.not.be.undefined;
    expect(apiConfig.BASE_URL).to.be.a('string');
    expect(apiConfig.API_KEY).to.be.a('string');
  });
});
