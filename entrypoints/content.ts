import { defineContentScript } from "#imports";
import { browser } from "wxt/browser";

import type { TabMessage } from "../src/types/messaging";

export default defineContentScript({
  // M1: only local fixture pages
  matches: ["http://localhost/*", "http://127.0.0.1/*"],

  main() {
    console.log("[CareerPilot] Content script initialized:", location.href);

    // Listen for messages from the background service worker
    browser.runtime.onMessage.addListener(
      (message: TabMessage, _sender, sendResponse) => {
        console.log("[CareerPilot] Received message:", message);

        if (message.type !== "CAREERPILOT_CONTENT_PING") {
          return undefined;
        }

        console.log("[CareerPilot] Ping received successfully");

        sendResponse({
          ok: true,
          message: "Connected to the local fixture page.",
        });

        return true;
      },
    );

    console.log("[CareerPilot] Listener registered");

    // Notify background that the content script is ready
    browser.runtime
      .sendMessage({
        type: "CONTENT_SCRIPT_READY",
        url: location.href,
      })
      .then((response) => {
        console.log("[CareerPilot] Ready handshake response:", response);
      })
      .catch((error) => {
        console.error("[CareerPilot] Ready handshake failed:", error);
      });
  },
});
