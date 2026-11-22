import { defineBackground } from "#imports";
import { browser } from "wxt/browser";

import type {
  RuntimeMessage,
  RuntimeResponse,
  TabMessage,
} from "../src/types/messaging";

export default defineBackground(() => {
  console.log("[CareerPilot] Background service worker started");

  browser.runtime.onMessage.addListener(
    async (
      message: RuntimeMessage,
      sender,
    ): Promise<RuntimeResponse | undefined> => {
      console.log("[CareerPilot] Message received:", message);

      console.log("[CareerPilot] Sender details:", {
        tabId: sender.tab?.id,
        url: sender.url,
        frameId: sender.frameId,
      });

      // 1. Content script initialization handshake
      if (message.type === "CONTENT_SCRIPT_READY") {
        console.log("[CareerPilot] Content script ready:", message.url);

        return {
          ok: true,
          message: "Content script registered.",
        };
      }

      // 2. Ignore unsupported messages
      if (message.type !== "PING_ACTIVE_TAB") {
        return undefined;
      }

      // 3. Find the active tab
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const tab = tabs[0];

      console.log("[CareerPilot] Active tab:", {
        id: tab?.id,
        url: tab?.url,
      });

      if (!tab?.id) {
        return {
          ok: false,
          error: "No active tab is available.",
        };
      }

      // 4. Send message to content script
      try {
        const ping: TabMessage = {
          type: "CAREERPILOT_CONTENT_PING",
        };

        console.log("[CareerPilot] Sending ping to tab:", tab.id);

        const response = await browser.tabs.sendMessage(tab.id, ping);

        console.log("[CareerPilot] Content script response:", response);

        return response as RuntimeResponse;
      } catch (error) {
        console.error("[CareerPilot] Content script messaging failed:", error);

        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );
});
