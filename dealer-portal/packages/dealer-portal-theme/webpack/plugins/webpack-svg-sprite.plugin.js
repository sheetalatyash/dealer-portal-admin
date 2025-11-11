// Creates svg sprite during build process

const glob = require('glob');
const SvgSpritemapPlugin = require('svg-spritemap-webpack-plugin');

const src = './packages/dealer-portal-theme/src/images/**/*.svg';
const filename = 'images/icons/icons.svg';

const svgFiles = glob.sync(src);

// ✅ Only export the plugin if SVGs exist
if (svgFiles.length > 0) {
  module.exports = new SvgSpritemapPlugin(src, {
    output: {
      filename,
      svgo: {
        plugins: [
          {
            name: 'cleanupIDs',
            active: false,
          },
        ],
      },
    },
    sprite: {
      prefix: false,
      generate: {
        title: false,
      },
    },
  });
} else {
  console.warn('⚠️  No SVG files found for spritemap. Skipping svg-spritemap-webpack-plugin.');
  module.exports = () => {}; // Return a no-op function to avoid plugin error
}
