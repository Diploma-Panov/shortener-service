module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/src/__tests__/utils/",
    "/src/__tests__/e2e/",
  ]
};
