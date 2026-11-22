import { browser } from 'wxt/browser';
import type { TabMessage } from '../src/types/messaging';

export default defineContentScript({
  // Local fixture scope only: M1 deliberately avoids broad host permissions.
  matches: ['http://localhost/*', 'http://127.0.0.1/*'],
  main() {
    browser.runtime.onMessage.addListener((message: TabMessage) => {
      if (message.type !== 'CAREERPILOT_CONTENT_PING') return undefined;
      return { ok: true, message: 'Connected to the local fixture page.' };
    });
  },
});
