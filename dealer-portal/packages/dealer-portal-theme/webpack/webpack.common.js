const path = require('path');
const copyPlugin = require('./plugins/webpack-copy.plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    'crp-theme': path.resolve(__dirname, '../src/themes/crp/crp-theme.scss'),
    'ind-theme': path.resolve(__dirname, '../src/themes/ind/ind-theme.scss'),
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  output: {
    clean: true,
    filename: 'js/[name].min.js',
    path: path.resolve(__dirname, '../../../dist/packages/dealer-portal-theme'),
  },
  plugins: [
    copyPlugin,
    new MiniCssExtractPlugin({
      filename: 'css/[name].min.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              api: 'modern',
              sassOptions: {
                quietDeps: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(woff2?|ttf|eot|otf|svg)$/,
        include: /fonts/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[contenthash][ext]',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      `...`, // preserves existing JS minimizers
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
            },
          ],
        },
      }),
    ],
  },
};
