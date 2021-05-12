const esModules = ['unist-util-visit', 'unist-util-select', 'mdast-util-to-string', 'unist-util-is', 'zwitch'].join(
  '|',
);

module.exports = {
  preset: '@stoplight/scripts',
  testEnvironment: 'node',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  globals: {
    'ts-jest': {
      tsconfig: {
        allowJs: true,
      },
    },
  },
};
