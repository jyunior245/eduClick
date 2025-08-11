module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**\\tests\\**\\*.test.ts'],
  modulePaths: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  roots: ['<rootDir>'],
};