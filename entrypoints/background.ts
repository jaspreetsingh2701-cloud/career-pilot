import { browser } from 'wxt/browser';
import type { RuntimeMessage, RuntimeResponse, TabMessage } from '../src/types/messaging';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message: RuntimeMessage): Promise<RuntimeResponse | undefined> => {
    if (message.type !== 'PING_ACTIVE_TAB') return undefined;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { ok: false, error: 'No active tab is available.' };
    try {
      const ping: TabMessage = { type: 'CAREERPILOT_CONTENT_PING' };
      return await browser.tabs.sendMessage(tab.id, ping) as RuntimeResponse;
    } catch {
      return { ok: false, error: 'No local fixture content script responded. The M1 script only runs on localhost pages.' };
    }
  });
});
