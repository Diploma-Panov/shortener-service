module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/src/__tests__/utils/",
    "/src/__tests__/e2e/",
  ]
};
