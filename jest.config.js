const esModules = ['unist-util-visit', 'unist-util-select', 'mdast-util-to-string', 'unist-util-is', 'zwitch'].join(
  '|',
);

module.exports = {
  preset: '@stoplight/scripts',
  testEnvironment: 'node',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { cwd: __dirname, configFile: './babel-jest.config.json' }],
  },
};
