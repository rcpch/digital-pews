import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../pews-chart/**/*.stories.@(js|ts)'],
  staticDirs: [{ from: '../pews-chart', to: '/' }],
  // Controls, actions, viewport, backgrounds, toolbars, docs etc. are built into
  // Storybook core since v9 (the old @storybook/addon-essentials is discontinued).
  addons: [],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
};

export default config;
