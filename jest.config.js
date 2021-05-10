export default {
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true,
    },
  },
};
