import { defineBackground } from "#imports";
import { browser } from "wxt/browser";
import type { RuntimeMessage, RuntimeResponse, TabMessage } from "../src/types/messaging";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message: RuntimeMessage): Promise<RuntimeResponse | undefined> => {
    if (message.type === "CONTENT_SCRIPT_READY") return { ok: true, message: "Content script registered." };
    if (message.type !== "PING_ACTIVE_TAB") return undefined;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab?.id) return { ok: false, error: "No active tab is available." };
    try {
      const ping: TabMessage = { type: "CAREERPILOT_CONTENT_PING" };
      return await browser.tabs.sendMessage(tab.id, ping) as RuntimeResponse;
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
});
