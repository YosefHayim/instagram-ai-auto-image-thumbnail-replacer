import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entrypoints',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Instagram AI Optimizer',
    description: 'AI-powered Instagram feed remastering extension with premium animations',
    version: '0.0.1',
    permissions: ['storage', 'activeTab', 'tabs'],
    host_permissions: [
      'https://www.instagram.com/*',
      'https://instagram.com/*'
    ],
    minimum_chrome_version: '88',
  },
  runner: {
    startUrls: ['https://www.instagram.com/'],
  },
});
