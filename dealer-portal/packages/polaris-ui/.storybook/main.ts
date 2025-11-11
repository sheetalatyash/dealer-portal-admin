import type { StorybookConfig } from '@storybook/angular';
import path, { dirname, join } from 'path';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(ts|mdx|ts)'],
  addons: [getAbsolutePath("@storybook/addon-essentials")],
  staticDirs: ['theme'],
  framework: {
    name: getAbsolutePath("@storybook/angular"),
    options: {},
  },
  docs: {
    defaultName: 'Docs'
  },
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      include: [
        path.resolve(__dirname),
      ],
    });

    console.log('✅ CSS loader added for:', path.resolve(__dirname));
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
