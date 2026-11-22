import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'CareerPilot',
    description: 'Local-first job application form assistance.',
    permissions: ['storage', 'sidePanel', 'activeTab', 'clipboardWrite'],
    side_panel: { default_path: 'sidepanel.html' },
  },
});
