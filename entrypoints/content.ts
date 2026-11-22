import { defineContentScript } from "#imports";
import { browser } from "wxt/browser";
import { detectApplicationFields } from "../src/features/detection/detect-fields";
import { fillApprovedFields } from "../src/features/filling/fill-approved-fields";
import type { TabMessage } from "../src/types/messaging";

type CareerPilotWindow = typeof globalThis & { __careerPilotMessageListenerRegistered?: boolean };

export default defineContentScript({
  matches: ["http://localhost/*", "http://127.0.0.1/*"],
  main() {
    const pageGlobal = globalThis as CareerPilotWindow;
    if (pageGlobal.__careerPilotMessageListenerRegistered) return;
    pageGlobal.__careerPilotMessageListenerRegistered = true;

    browser.runtime.onMessage.addListener((message: TabMessage, sender, sendResponse) => {
      if (sender.id !== browser.runtime.id) return undefined;
      if (message.type === "CAREERPILOT_CONTENT_PING") {
        sendResponse({ ok: true, message: "Connected to the local fixture page." });
        return true;
      }
      if (message.type === "DETECT_FORM_FIELDS") {
        try { sendResponse({ ok: true, fields: detectApplicationFields(document) }); }
        catch (error) { sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }); }
        return true;
      }
      if (message.type === "FILL_APPROVED_FIELDS") {
        try { sendResponse({ ok: true, results: fillApprovedFields(document, message.targets) }); }
        catch (error) { sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }); }
        return true;
      }
      return undefined;
    });
  },
});
