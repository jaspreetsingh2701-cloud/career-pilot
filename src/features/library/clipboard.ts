export interface PlainTextClipboard {
  writeText(text: string): Promise<void>;
}

/** Writes the exact supplied string; do not trim or normalize whitespace. */
export async function writePlainText(value: string, clipboard: PlainTextClipboard): Promise<void> {
  await clipboard.writeText(value);
}
