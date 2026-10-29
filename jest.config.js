const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"],
  // tests/e2e/** 는 Playwright spec (npm run test:e2e) — Jest 수집 대상에서 제외
  testPathIgnorePatterns: [
    ...(jestConfig.testPathIgnorePatterns || ["/node_modules/"]),
    "<rootDir>/tests/e2e/"
  ]
};
