import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import config from '@stoplight/scripts/rollup.config';

const newConfig = config.slice().map(entry => ({ ...entry }));
newConfig[0].external = [
  '@stoplight/types',
  '@stoplight/yaml',
  'lodash',

  // these are CJS, can stay
  'mdast-util-to-markdown',
];
newConfig[0].plugins.unshift(nodeResolve());

newConfig[1].plugins.unshift(commonjs()); // needed because of mdast-util-to-markdown which is CJS

export default newConfig;
