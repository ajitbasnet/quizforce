import type { StorybookConfig } from '@storybook/react-vite'
import type { Plugin } from 'vite'
import { mergeConfig } from 'vite'

function isProjectOnlyPlugin(plugin: Plugin | false | Plugin[] | undefined): boolean {
  if (!plugin || Array.isArray(plugin)) return false
  const name = plugin.name ?? ''
  return (
    name.startsWith('vite-plugin-pwa') ||
    name === 'api-proxy' ||
    name.includes('visualizer')
  )
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      viteConfigPath: '../vite.storybook.config.ts',
    },
  },
  async viteFinal(config) {
    config.plugins = config.plugins?.filter((plugin) => !isProjectOnlyPlugin(plugin))

    return mergeConfig(config, {
      resolve: {
        dedupe: ['i18next', 'react-i18next'],
      },
    })
  },
}

export default config
