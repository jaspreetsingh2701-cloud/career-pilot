import { defineContentScript } from "#imports";
import { browser } from "wxt/browser";
import { detectApplicationFields } from "../src/features/detection/detect-fields";
import type { TabMessage } from "../src/types/messaging";

export default defineContentScript({
  matches: ["http://localhost/*", "http://127.0.0.1/*"],
  main() {
    browser.runtime.onMessage.addListener((message: TabMessage, _sender, sendResponse) => {
      if (message.type === "CAREERPILOT_CONTENT_PING") {
        sendResponse({ ok: true, message: "Connected to the local fixture page." });
        return true;
      }
      if (message.type === "DETECT_FORM_FIELDS") {
        try { sendResponse({ ok: true, fields: detectApplicationFields(document) }); }
        catch (error) { sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }); }
        return true;
      }
      return undefined;
    });
  },
});
