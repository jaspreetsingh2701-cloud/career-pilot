import { defineContentScript } from "#imports";
import { browser } from "wxt/browser";
import { detectApplicationFields } from "../src/features/detection/detect-fields";
import { fillApprovedFields } from "../src/features/filling/fill-approved-fields";
import type { TabMessage } from "../src/types/messaging";

type CareerPilotWindow = typeof globalThis & { __careerPilotMessageListenerRegistered?: boolean };

function attachDocument(root: Document, target: Extract<TabMessage, { type: "ATTACH_DOCUMENT" }>) {
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="file"]'));
  const input = inputs[target.index];
  if (!input || (target.elementId && input.id !== target.elementId) || (target.name && input.name !== target.name)) {
    return { ok: false, message: "The upload field changed after scanning. Re-scan the page." };
  }
  if (input.disabled || !target.dataUrl.startsWith("data:")) {
    return { ok: false, message: "This upload field or document is unsupported." };
  }
  try {
    const [header, encoded] = target.dataUrl.split(",", 2);
    const mimeType = header.match(/^data:([^;]+)/)?.[1] ?? "application/octet-stream";
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const file = new File([bytes], target.fileName, { type: mimeType });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: true, message: `Attached ${target.fileName}.` };
  } catch {
    return { ok: false, message: "The browser or website did not allow this document to be attached." };
  }
}

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
        try {
          const detected = detectApplicationFields(document);
          sendResponse({
            ok: true,
            fields: detected.filter(field => field.controlType !== "file"),
            uploadFields: detected.filter(field => field.controlType === "file"),
          });
        } catch (error) {
          sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
        }
        return true;
      }
      if (message.type === "ATTACH_DOCUMENT") {
        sendResponse(attachDocument(document, message));
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
