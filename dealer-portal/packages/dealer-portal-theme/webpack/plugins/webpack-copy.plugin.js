const copyPlugin = require('copy-webpack-plugin');
const src = 'packages/dealer-portal-theme/src';

const images = {
  from: `${src}/images`,
  to: 'images',
  noErrorOnMissing: true,
};

module.exports = new copyPlugin({
  patterns: [images],
});
