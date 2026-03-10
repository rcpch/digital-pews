import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../apps/chart-ui/**/*.stories.@(js|ts)'],
  staticDirs: [{ from: '../apps/chart-ui', to: '/apps/chart-ui' }],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
