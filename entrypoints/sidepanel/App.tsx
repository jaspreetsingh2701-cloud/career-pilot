import { useState } from 'react';
import { browser } from 'wxt/browser';
import type { RuntimeMessage, RuntimeResponse } from '../../src/types/messaging';
import { Banner } from '../../src/components/common/Banner';
import { Button } from '../../src/components/common/Button';
import { SectionHeader } from '../../src/components/common/SectionHeader';

export default function App() {
  const [message, setMessage] = useState('Foundation ready. Open a local fixture page to test messaging.');
  const [busy, setBusy] = useState(false);

  async function pingActiveTab() {
    setBusy(true);
    setMessage('Checking the active tab…');
    try {
      const request: RuntimeMessage = { type: 'PING_ACTIVE_TAB' };
      const response = await browser.runtime.sendMessage(request) as RuntimeResponse;
      setMessage(response.ok ? response.message : response.error);
    } catch {
      setMessage('No CareerPilot fixture content script responded. Open the local fixture page and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-page text-text-primary">
      <header className="border-b border-border bg-card px-panel py-4">
        <div className="flex items-center justify-between">
          <div><p className="text-[17px] font-bold leading-6">CareerPilot</p><p className="mt-0.5 text-[11px] text-text-secondary">Local-first application assistant</p></div>
          <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success">Local only</span>
        </div>
      </header>
      <section className="flex-1 space-y-4 p-panel">
        <div className="rounded-card border border-border bg-card p-card">
          <SectionHeader title="Extension foundation" />
          <p className="mt-2 text-sm leading-5 text-text-secondary">The side panel, design tokens and extension message path are in place. Product workflows will be added milestone by milestone.</p>
          <Banner className="mt-3">Nothing is scanned or filled automatically. CareerPilot never submits applications.</Banner>
        </div>
        <div className="rounded-card border border-border bg-card p-card">
          <SectionHeader title="Local messaging check" />
          <p className="mt-2 text-xs leading-5 text-text-secondary">The initial content script is intentionally limited to localhost fixture pages. This verifies messaging without requesting broad website access.</p>
          <Button className="mt-3 w-full" onClick={pingActiveTab} disabled={busy}>{busy ? 'Checking…' : 'Ping active local page'}</Button>
          <p className="mt-3 rounded-control bg-muted p-3 text-xs leading-5" role="status" aria-live="polite">{message}</p>
        </div>
      </section>
      <footer className="border-t border-border bg-card px-panel py-3 text-center text-[11px] text-text-secondary">You stay in control · Review every suggestion · Submit manually</footer>
    </main>
  );
}
