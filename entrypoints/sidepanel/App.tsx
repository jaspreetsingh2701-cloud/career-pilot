import { useEffect, useState, type ChangeEvent } from 'react';
import { browser } from 'wxt/browser';
import { Banner } from '../../src/components/common/Banner';
import { Button } from '../../src/components/common/Button';
import { SectionHeader } from '../../src/components/common/SectionHeader';
import { getProfile, saveProfile } from '../../src/features/profile/repository';
import { emptyProfile, type UserProfile } from '../../src/features/profile/types';
import { addDocument, clearLibrary, deleteAnswer, deleteDocument, deleteSnippet, getDocumentBlob, listAnswers, listDocuments, listSnippets, renameDocument, saveAnswer, saveSnippet, setDefaultDocument } from '../../src/features/library/database';
import type { CareerDocument, DocumentType, MessageSnippet, SavedAnswer } from '../../src/features/library/types';
import { createBackup, restoreBackup } from '../../src/features/backup/backup';
import { getThemePreference, saveThemePreference, type ThemePreference } from '../../src/features/settings/theme';
import { writePlainText } from '../../src/features/library/clipboard';
import { evaluateWebsiteAccess, getWebsiteAccessRules, parseHostRules, saveWebsiteAccessRules, type WebsiteAccessRules } from '../../src/features/access-rules/rules';
import { suggestFieldMappings, type MappingSuggestion } from '../../src/features/mapping/match-fields';
import { getProfileCandidateValues } from '../../src/features/profile/utils/profile-field-mapper';
import type { DetectedField } from '../../src/features/detection/detect-fields';
import type { FillResult, FillTarget } from '../../src/features/filling/fill-approved-fields';

type Tab = 'documents' | 'profile' | 'answers' | 'settings';
const inputClass = 'mt-1 min-h-11 w-full rounded-control border border-border-input bg-card px-3 text-sm text-text-primary placeholder:text-text-secondary';
const labelClass = 'block text-xs font-semibold text-text-secondary';
const newId = () => crypto.randomUUID();

export default function App() {
  const [tab, setTab] = useState<Tab>('documents');
  const [profile, setProfile] = useState<UserProfile>(emptyProfile());
  const [documents, setDocuments] = useState<CareerDocument[]>([]);
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [snippets, setSnippets] = useState<MessageSnippet[]>([]);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [documentType, setDocumentType] = useState<DocumentType>('resume');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clipboardFallback, setClipboardFallback] = useState('');
  const [dirty, setDirty] = useState(false);
  const [answerEditingId, setAnswerEditingId] = useState<string | null>(null);
  const [customEditingId, setCustomEditingId] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customType, setCustomType] = useState<'text' | 'number' | 'date' | 'url' | 'textarea'>('text');
  const [customAliases, setCustomAliases] = useState('');
  const [customSection, setCustomSection] = useState('Additional');
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerBody, setAnswerBody] = useState('');
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetBody, setSnippetBody] = useState('');
  const [accessRules, setAccessRules] = useState<WebsiteAccessRules>({ allowlist: [], blocklist: [], includeSubdomains: true });
  const [allowlistText, setAllowlistText] = useState('');
  const [blocklistText, setBlocklistText] = useState('');
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [mappingSuggestions, setMappingSuggestions] = useState<MappingSuggestion[]>([]);
  const [approvedFields, setApprovedFields] = useState<Record<string, boolean>>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [replaceFields, setReplaceFields] = useState<Record<string, boolean>>({});
  const [fillResults, setFillResults] = useState<FillResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [filling, setFilling] = useState(false);
  const [scannedTab, setScannedTab] = useState<{ id: number; url: string } | null>(null);

  async function refreshLibrary() {
    const [docs, savedAnswers, savedSnippets] = await Promise.all([listDocuments(), listAnswers(), listSnippets()]);
    setDocuments(docs); setAnswers(savedAnswers); setSnippets(savedSnippets);
  }
  useEffect(() => {
    void Promise.all([getProfile(), getThemePreference(), getWebsiteAccessRules()]).then(([p, t, rules]) => { setProfile({ ...p, customFields: p.customFields ?? [] }); setTheme(t); setAccessRules(rules); setAllowlistText(rules.allowlist.join('\n')); setBlocklistText(rules.blocklist.join('\n')); });
    void refreshLibrary();
  }, []);
  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => setStatus(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [status]);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches));
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  async function persistProfile() {
    setBusy(true);
    try { setProfile(await saveProfile(profile)); setDirty(false); setStatus('Profile saved successfully on this device.'); }
    catch (error) { setStatus(error instanceof Error ? `Profile save failed: ${error.message}` : 'Profile save failed. Please try again.'); }
    finally { setBusy(false); }
  }
  async function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(`Importing ${file.name}…`);
    try {
      await addDocument(file, documentType);
      await refreshLibrary(); setStatus(`${file.name} uploaded successfully (${(file.size / 1024).toFixed(0)} KB).`);
    } catch (error) { setStatus(error instanceof Error ? `Upload failed: ${error.message}` : 'Document import failed.'); }
    finally { setUploading(false); event.target.value = ''; }
  }
  async function addSavedAnswer() {
    if (!answerTitle.trim() || !answerBody.trim()) { setStatus('Enter both a title and an answer.'); return; }
    const now = Date.now();
    const existing = answers.find(item => item.id === answerEditingId);
    await saveAnswer({ id: existing?.id ?? newId(), title: answerTitle.trim(), answer: answerBody, keywords: existing?.keywords ?? [], category: existing?.category, createdAt: existing?.createdAt ?? now, updatedAt: now });
    setAnswerTitle(''); setAnswerBody(''); setAnswerEditingId(null); await refreshLibrary(); setStatus(existing ? 'Saved answer updated.' : 'Saved answer added.');
  }
  async function copyText(value: string, label: string) {
    try { await writePlainText(value, navigator.clipboard); setClipboardFallback(''); setStatus(`${label} copied to clipboard.`); }
    catch { setClipboardFallback(value); setStatus('Clipboard access was blocked. Click the text below to select it, then copy manually.'); }
  }
  function addCustomField() {
    if (!customLabel.trim() || !customValue.trim()) { setStatus('Add a label and value for the custom field.'); return; }
    const existing = (profile.customFields ?? []).find(field => field.id === customEditingId);
    const field = { id: existing?.id ?? newId(), key: existing?.key ?? `custom_${newId().replace(/-/g, '')}`, label: customLabel.trim(), value: customValue, type: customType, section: customSection.trim() || 'Additional', aliases: customAliases.split(',').map(value => value.trim()).filter(Boolean) };
    setProfile(current => ({ ...current, customFields: existing ? (current.customFields ?? []).map(item => item.id === existing.id ? field : item) : [...(current.customFields ?? []), field] }));
    setDirty(true); setCustomEditingId(null); setCustomLabel(''); setCustomValue(''); setCustomAliases(''); setStatus(existing ? 'Custom field updated. Save your profile to keep it.' : 'Custom field added. Save your profile to keep it.');
  }
  async function addMessageSnippet() {
    if (!snippetTitle.trim() || !snippetBody.trim()) return;
    const now = Date.now();
    await saveSnippet({ id: newId(), title: snippetTitle.trim(), body: snippetBody, createdAt: now, updatedAt: now });
    setSnippetTitle(''); setSnippetBody(''); await refreshLibrary(); setStatus('Message snippet added.');
  }
  async function updateTheme(value: ThemePreference) { setTheme(value); await saveThemePreference(value); }
  async function persistAccessRules() {
    try { const next = { allowlist: parseHostRules(allowlistText), blocklist: parseHostRules(blocklistText), includeSubdomains: accessRules.includeSubdomains }; await saveWebsiteAccessRules(next); setAccessRules(next); setAllowlistText(next.allowlist.join('\n')); setBlocklistText(next.blocklist.join('\n')); setStatus('Website access rules saved locally.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not save website access rules.'); }
  }
  async function detectCurrentForm() {
    setScanning(true); setFillResults([]); setApprovedFields({}); setEditedValues({}); setReplaceFields({}); setScannedTab(null);
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id || !activeTab.url) { setStatus('The active tab URL is unavailable.'); setScanning(false); return; }
    const decision = evaluateWebsiteAccess(activeTab.url, accessRules);
    if (!decision.allowed) { setStatus(decision.reason); setScanning(false); return; }
    try {
      await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ['content-scripts/content.js'] });
      const response = await chrome.tabs.sendMessage(activeTab.id, { type: 'DETECT_FORM_FIELDS' });
      if (!response?.ok) { setStatus(response?.error ?? 'Could not inspect this page.'); return; }
      const fields = response.fields as DetectedField[];
      setScannedTab({ id: activeTab.id, url: activeTab.url });
      setDetectedFields(fields);
      const suggestions = suggestFieldMappings({ fields, profileValues: getProfileCandidateValues(profile), savedAnswers: answers });
      setMappingSuggestions(suggestions);
      setStatus(fields.length ? `Detected ${fields.length} fields. Review every suggestion before filling.` : 'No supported form fields were found on this page.');
    } catch (error) { setStatus(error instanceof Error ? 'Detection unavailable: ' + error.message : 'Detection is unavailable on this page.'); }
    finally { setScanning(false); }
  }
  async function fillApproved() {
    const selected = detectedFields.filter(field => approvedFields[field.id]);
    if (!selected.length) { setStatus('Approve at least one field before filling.'); return; }
    setFilling(true); setFillResults([]);
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id || !activeTab.url || !scannedTab || activeTab.id !== scannedTab.id || activeTab.url !== scannedTab.url) { setStatus('The active tab changed after scanning. Re-scan before filling.'); return; }
      const decision = evaluateWebsiteAccess(activeTab.url, accessRules);
      if (!decision.allowed) { setStatus(decision.reason); return; }
      const targets: FillTarget[] = selected.map(field => {
        const suggestion = mappingSuggestions.find(item => item.detectedFieldId === field.id);
        return {
          fieldId: field.id, index: field.index,
          tagName: field.tagName, name: field.name, elementId: field.elementId,
          controlType: field.controlType,
          expectedValue: editedValues[field.id] ?? suggestion?.selectedOption?.value ?? suggestion?.proposedValue ?? '',
          approved: true, replaceExisting: replaceFields[field.id] === true,
        };
      }).filter(target => target.expectedValue.trim());
      if (!targets.length) { setStatus('No approved fields have a usable value.'); return; }
      const response = await chrome.tabs.sendMessage(activeTab.id, { type: 'FILL_APPROVED_FIELDS', targets });
      if (!response?.ok) { setStatus(response?.error ?? 'Autofill could not be completed.'); return; }
      setFillResults(response.results as FillResult[]);
      const filled = (response.results as FillResult[]).filter(item => item.status === 'filled').length;
      setStatus(`Fill finished: ${filled} field(s) updated. Review the results and page before submitting manually.`);
    } catch (error) { setStatus(error instanceof Error ? 'Autofill failed: ' + error.message : 'Autofill failed.'); }
    finally { setFilling(false); }
  }
  async function clearAll() {
    if (!window.confirm('Delete your CareerPilot profile, documents, saved answers and snippets from this browser?')) return;
    await Promise.all([clearLibrary(), browser.storage.local.remove('careerPilot.profile')]);
    setProfile(emptyProfile()); await refreshLibrary(); setStatus('Local CareerPilot data cleared.');
  }

  return (
    <main className="flex min-h-screen flex-col bg-page text-text-primary">
      <header className="border-b border-border bg-card px-panel py-4">
        <div className="flex items-center justify-between">
          <div><p className="text-[17px] font-bold leading-6">CareerPilot</p><p className="mt-0.5 text-[11px] text-text-secondary">Local-first application assistant</p></div>
          <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success">Local only</span>
        </div>
        <nav className="mt-4 grid grid-cols-4 gap-1" aria-label="CareerPilot sections">
          {(['documents', 'profile', 'answers', 'settings'] as Tab[]).map(item => <button key={item} onClick={() => setTab(item)} className={`min-h-10 rounded-control px-1 text-xs font-semibold capitalize ${tab === item ? 'bg-accent text-white' : 'bg-muted text-text-secondary'}`} aria-current={tab === item ? 'page' : undefined}>{item}</button>)}
        </nav>
      </header>

      <section className="flex-1 space-y-4 p-panel">
        {tab === 'profile' && <div className="rounded-card border border-border bg-card p-card">
          <SectionHeader title="Candidate profile" />
          <p className="mb-4 mt-2 text-xs leading-5 text-text-secondary">Add only information you want to reuse in job applications. Optional fields can stay empty.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>First name<input className={inputClass} value={profile.firstName} onChange={e => { setProfile({ ...profile, firstName: e.target.value }); setDirty(true); }} /></label>
            <label className={labelClass}>Last name<input className={inputClass} value={profile.lastName} onChange={e => { setProfile({ ...profile, lastName: e.target.value }); setDirty(true); }} /></label>
          </div>
          <label className={`${labelClass} mt-3`}>Email<input type="email" className={inputClass} value={profile.email} onChange={e => { setProfile({ ...profile, email: e.target.value }); setDirty(true); }} /></label>
          <div className="mt-3 grid grid-cols-[7rem_1fr] gap-2"><label className={labelClass}>Country code<select className={inputClass} value={profile.phoneCountryCode ?? '+91'} onChange={e => { setProfile({ ...profile, phoneCountryCode: e.target.value }); setDirty(true); }}><option value="+91">India (+91)</option><option value="+1">US/Canada (+1)</option><option value="+44">UK (+44)</option><option value="+61">Australia (+61)</option><option value="+971">UAE (+971)</option><option value="+65">Singapore (+65)</option><option value="+49">Germany (+49)</option><option value="+33">France (+33)</option></select></label><label className={labelClass}>Phone number<input type="tel" className={inputClass} value={profile.phone ?? ''} onChange={e => { setProfile({ ...profile, phone: e.target.value }); setDirty(true); }} /></label></div>
          <label className={`${labelClass} mt-3`}>Current location<input className={inputClass} value={profile.currentLocation ?? ''} onChange={e => { setProfile({ ...profile, currentLocation: e.target.value }); setDirty(true); }} /></label>
          <label className={`${labelClass} mt-3`}>Current designation<input className={inputClass} value={profile.currentDesignation ?? ''} onChange={e => { setProfile({ ...profile, currentDesignation: e.target.value }); setDirty(true); }} /></label>
          <label className={`${labelClass} mt-3`}>Current company<input className={inputClass} value={profile.currentCompany ?? ''} onChange={e => { setProfile({ ...profile, currentCompany: e.target.value }); setDirty(true); }} /></label>
          <label className={`${labelClass} mt-3`}>Preferred role<input className={inputClass} value={profile.preferredRole ?? ''} onChange={e => { setProfile({ ...profile, preferredRole: e.target.value }); setDirty(true); }} /></label>
          <div className="mt-4 rounded-control bg-muted p-3 text-xs text-text-secondary">{dirty ? 'You have unsaved profile changes.' : 'Your profile is saved locally.'} {!profile.firstName.trim() || !profile.email.trim() ? 'First name and email are required to save.' : ''}</div>
          <Button className="mt-2 w-full" onClick={persistProfile} disabled={busy || !dirty || !profile.firstName.trim() || !profile.email.trim()}>{busy ? 'Saving…' : dirty ? 'Save profile' : 'Saved'}</Button>
          <div className="mt-5 border-t border-border pt-4"><SectionHeader title="Custom profile fields" />
            <p className="mt-2 text-xs leading-5 text-text-secondary">Add information that is not in the standard profile. Labels and aliases help CareerPilot recognize differently worded application fields.</p>
            <label className={`${labelClass} mt-3`}>Field label<input className={inputClass} value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="e.g. Current CTC" /></label>
            <label className={`${labelClass} mt-3`}>Value<input className={inputClass} value={customValue} onChange={e => setCustomValue(e.target.value)} placeholder="e.g. 41 LPA" /></label>
            <label className={`${labelClass} mt-3`}>Value type<select className={inputClass} value={customType} onChange={e => setCustomType(e.target.value as typeof customType)}><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="url">URL</option><option value="textarea">Long text</option></select></label>
            <label className={`${labelClass} mt-3`}>Aliases (comma separated)<input className={inputClass} value={customAliases} onChange={e => setCustomAliases(e.target.value)} placeholder="current salary, present CTC" /></label>
            <label className={`${labelClass} mt-3`}>Section<input className={inputClass} value={customSection} onChange={e => setCustomSection(e.target.value)} /></label>
            <Button className="mt-3 w-full" variant="secondary" onClick={addCustomField}>{customEditingId ? 'Update custom field' : 'Add custom field'}</Button>
            {customEditingId && <button className="mt-2 text-xs font-semibold text-text-secondary" onClick={() => { setCustomEditingId(null); setCustomLabel(''); setCustomValue(''); setCustomAliases(''); }}>Cancel editing</button>}
            <div className="mt-3 space-y-2">{(profile.customFields ?? []).map(field => <div key={field.id} className="rounded-control border border-border p-3"><p className="text-xs font-semibold">{field.label}</p><p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">{field.value}</p><p className="mt-1 text-[11px] text-text-secondary">{field.section} · {field.aliases.join(', ') || 'No aliases'}</p><div className="mt-2 flex gap-3"><button className="text-xs font-semibold text-accent" onClick={() => { setCustomEditingId(field.id); setCustomLabel(field.label); setCustomValue(field.value); setCustomType(field.type); setCustomAliases(field.aliases.join(', ')); setCustomSection(field.section ?? 'Additional'); }}>Edit</button><button className="text-xs font-semibold text-danger" onClick={() => { setProfile(current => ({ ...current, customFields: (current.customFields ?? []).filter(item => item.id !== field.id) })); setDirty(true); }}>Remove</button></div></div>)}</div>
          </div>
        </div>}

        {tab === 'documents' && <div className="rounded-card border border-border bg-card p-card">
          <SectionHeader title="Document library" count={documents.length} />
          <Button className="mb-3 w-full" onClick={() => void detectCurrentForm()}>Detect fields on active tab</Button>
          {scanning && <p className="mb-3 text-xs text-accent" role="status">Scanning active tab…</p>}
          {detectedFields.length > 0 && (() => {
            const fieldGroups = {
              required: detectedFields.filter(field => field.required),
              optionalSuggested: detectedFields.filter(field => !field.required && Boolean(mappingSuggestions.find(item => item.detectedFieldId === field.id)?.proposedValue)),
              optionalUnmatched: detectedFields.filter(field => !field.required && !mappingSuggestions.find(item => item.detectedFieldId === field.id)?.proposedValue),
            };
            const filledRequired = fieldGroups.required.filter(field => Boolean(field.currentValue)).length;
            const renderField = (field: DetectedField) => {
              const suggestion = mappingSuggestions.find(item => item.detectedFieldId === field.id);
              const result = fillResults.find(item => item.fieldId === field.id);
              const value = editedValues[field.id] ?? suggestion?.selectedOption?.value ?? suggestion?.proposedValue ?? '';
              const fillable = ['text','email','tel','url','number','date','month','week','time','datetime-local','search','textarea','select'].includes(field.controlType);
              return <div key={field.id} className="rounded-control border border-border px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="truncate text-xs font-semibold">{field.label || field.name || field.elementId || field.controlType}</p><p className="mt-0.5 text-[10px] text-text-secondary">{field.controlType} · {suggestion?.status ?? 'no-match'}{suggestion ? ` · ${suggestion.confidence}%` : ''}</p></div>
                  <span className="shrink-0 text-[10px] font-semibold text-text-secondary">{result?.status ?? (approvedFields[field.id] ? 'Approved' : field.currentValue ? 'Has value' : 'Empty')}</span>
                </div>
                {!fillable && <p className="mt-1 text-[10px] text-warning">Grouped-control support is not available yet.</p>}
                {suggestion?.alternatives && <p className="mt-1 text-[10px] text-warning">Multiple possible sources. Review or edit the value.</p>}
                <label className="mt-2 block text-[10px] font-semibold text-text-secondary">Value
                  <textarea rows={1} className={inputClass + ' h-9 min-h-9 resize-y overflow-hidden py-2'} value={value} onChange={event => setEditedValues(current => ({ ...current, [field.id]: event.target.value }))} placeholder="No suggestion — enter a value" />
                </label>
                {!!field.currentValue && <p className="mt-1 truncate text-[10px] text-text-secondary" title={field.currentValue}>Current value: {field.currentValue}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" disabled={!fillable || !value.trim()} checked={approvedFields[field.id] === true} onChange={event => setApprovedFields(current => ({ ...current, [field.id]: event.target.checked }))} /> Approve</label>
                  {!!field.currentValue && <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={replaceFields[field.id] === true} onChange={event => setReplaceFields(current => ({ ...current, [field.id]: event.target.checked }))} /> Replace existing</label>}
                </div>
                {result && <p className="mt-1 text-[10px] font-semibold" role="status">{result.status}: {result.message}</p>}
              </div>;
            };
            return <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <SectionHeader title="Review suggestions" count={detectedFields.length} />
                <div className="flex items-center gap-3">
                  <span className="group relative inline-flex">
                    <button type="button" aria-label="Autofill safety information" className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs font-semibold text-text-secondary">i</button>
                    <span role="tooltip" className="pointer-events-none absolute right-0 top-7 z-30 hidden w-64 rounded-control border border-border bg-card p-3 text-[11px] font-normal leading-5 text-text-primary shadow-lg group-hover:block group-focus-within:block">Review and edit each value. Only individually approved fields are sent to the page. Existing values are preserved unless replacement is explicitly enabled.</span>
                  </span>
                  <button className="text-xs font-semibold text-accent" onClick={() => { setDetectedFields([]); setMappingSuggestions([]); setApprovedFields({}); setFillResults([]); setScannedTab(null); }}>Clear</button>
                </div>
              </div>
              <details className="rounded-control border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-xs font-semibold">
                  <span>Optional fields</span>
                  <span className="text-[10px] font-normal text-text-secondary">{fieldGroups.optionalSuggested.length} suggestions · {fieldGroups.optionalUnmatched.length} without suggestions</span>
                </summary>
                <div className="space-y-2 border-t border-border p-2">
                  {fieldGroups.optionalSuggested.map(renderField)}
                  {fieldGroups.optionalUnmatched.length > 0 && <details className="rounded-control border border-border">
                    <summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold text-text-secondary">Fields without suggestions ({fieldGroups.optionalUnmatched.length})</summary>
                    <div className="space-y-2 border-t border-border p-2">{fieldGroups.optionalUnmatched.map(renderField)}</div>
                  </details>}
                  {!fieldGroups.optionalSuggested.length && !fieldGroups.optionalUnmatched.length && <p className="text-[11px] text-text-secondary">No optional fields detected.</p>}
                </div>
              </details>
              <div className="sticky bottom-0 z-10 -mx-3 space-y-1 border-t border-border bg-card/95 px-3 pb-2 pt-3 backdrop-blur">
                <Button className="w-full" onClick={() => void fillApproved()} disabled={filling || !Object.values(approvedFields).some(Boolean)}>{filling ? 'Filling…' : `Fill approved fields (${detectedFields.filter(field => approvedFields[field.id]).length})`}</Button>
                <p className="text-center text-[10px] text-text-secondary">Review the page and submit manually. CareerPilot never submits forms.</p>
              </div>
            </div>;
          })()}
          <p className="mb-3 mt-2 text-xs leading-5 text-text-secondary">Add your resume and cover letter here first. The library stores them locally; until form attachment is implemented, download a copy to upload manually. The intended application flow is resume first, then remaining fields from your profile and saved answers. Uploading a document does not change your profile. PDF, DOC or DOCX up to 5 MB.</p>
          <label className={labelClass}>Document type<select className={inputClass} value={documentType} onChange={e => setDocumentType(e.target.value as DocumentType)}><option value="resume">Resume</option><option value="cover-letter">Cover letter</option><option value="other">Other</option></select></label><label className="mt-3 block text-xs font-semibold text-text-secondary">Import document<input type="file" accept=".pdf,.doc,.docx" disabled={uploading} onChange={uploadDocument} className="mt-2 block w-full text-xs file:mr-2 file:min-h-10 file:rounded-control file:border-0 file:bg-accent file:px-3 file:text-white" /></label>
          {uploading && <p className="mt-2 text-xs text-accent" role="status">Uploading selected document…</p>}
          <div className="mt-4 space-y-2">{documents.map(doc => <div key={doc.id} className="rounded-control border border-border p-3">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="break-words text-xs font-semibold">{doc.name}</p><p className="mt-1 text-[11px] text-text-secondary">{doc.fileName} · {(doc.sizeBytes / 1024).toFixed(0)} KB</p></div>{doc.isDefault && <span className="shrink-0 rounded-full bg-success-bg px-2 py-1 text-[10px] font-semibold text-success">Default</span>}</div>
            <div className="mt-2 flex flex-wrap gap-3"><button className="text-xs font-semibold text-accent" onClick={async () => { const name = window.prompt('Rename document', doc.name); if (name?.trim()) { await renameDocument(doc.id, name.trim()); await refreshLibrary(); setStatus('Document renamed.'); } }}>Rename</button><button className="text-xs font-semibold text-accent" onClick={async () => { const blob = await getDocumentBlob(doc.id); if (!blob) { setStatus('Document file could not be found.'); return; } const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = doc.fileName; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Download</button>{doc.type !== 'other' && !doc.isDefault && <button className="text-xs font-semibold text-accent" onClick={async () => { await setDefaultDocument(doc.id, doc.type); await refreshLibrary(); }}>Set default</button>}<button className="text-xs font-semibold text-danger" onClick={async () => { if (window.confirm('Delete this document?')) { await deleteDocument(doc.id); await refreshLibrary(); } }}>Delete</button></div>
          </div>)}</div>
          {documents.length === 0 && <p className="mt-4 text-xs text-text-secondary">No documents yet. Import your first resume or cover letter.</p>}
        </div>}

        {tab === 'answers' && <div className="space-y-4">
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Saved answers" count={answers.length} />
            <label className={`${labelClass} mt-3`}>Title<input className={inputClass} value={answerTitle} onChange={e => setAnswerTitle(e.target.value)} placeholder="e.g. Why are you interested?" /></label>
            <label className={`${labelClass} mt-3`}>Answer<textarea className={`${inputClass} min-h-24 py-2`} value={answerBody} onChange={e => setAnswerBody(e.target.value)} /></label>
            <Button className="mt-3 w-full" onClick={addSavedAnswer}>{answerEditingId ? 'Update saved answer' : 'Add saved answer'}</Button>
            {answerEditingId && <button className="mt-2 text-xs font-semibold text-text-secondary" onClick={() => { setAnswerEditingId(null); setAnswerTitle(''); setAnswerBody(''); }}>Cancel editing</button>}
            <div className="mt-3 overflow-hidden rounded-control border border-border"><table className="w-full table-fixed text-left text-xs"><thead className="bg-muted text-text-secondary"><tr><th className="w-[27%] px-2 py-2 font-semibold">Title</th><th className="px-2 py-2 font-semibold">Answer</th><th className="w-[6.5rem] px-2 py-2 font-semibold">Actions</th></tr></thead><tbody>{answers.map(item => <tr key={item.id} className="border-t border-border"><td className="truncate px-2 py-2 font-semibold" title={item.title}>{item.title}</td><td className="truncate px-2 py-2 text-text-secondary" title={item.answer}>{item.answer}</td><td className="px-2 py-2"><div className="flex flex-wrap gap-x-2 gap-y-1"><button className="font-semibold text-accent" onClick={() => void copyText(item.answer, 'Saved answer')}>Copy</button><button className="font-semibold text-accent" onClick={() => { setAnswerEditingId(item.id); setAnswerTitle(item.title); setAnswerBody(item.answer); }}>Edit</button><button className="font-semibold text-danger" onClick={async () => { await deleteAnswer(item.id); await refreshLibrary(); setStatus('Saved answer deleted.'); }}>Delete</button></div></td></tr>)}</tbody></table>{answers.length === 0 && <p className="p-3 text-xs text-text-secondary">No saved answers yet.</p>}</div>
          </div>
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Message snippets" count={snippets.length} />
            <label className={`${labelClass} mt-3`}>Title<input className={inputClass} value={snippetTitle} onChange={e => setSnippetTitle(e.target.value)} placeholder="e.g. Recruiter follow-up" /></label>
            <label className={`${labelClass} mt-3`}>Message<textarea className={`${inputClass} min-h-24 py-2`} value={snippetBody} onChange={e => setSnippetBody(e.target.value)} /></label>
            <Button className="mt-3 w-full" onClick={addMessageSnippet}>Add snippet</Button>
            <div className="mt-3 space-y-2">{snippets.map(item => <div key={item.id} className="rounded-control border border-border p-3"><p className="text-xs font-semibold">{item.title}</p><p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">{item.body}</p><div className="mt-2 flex gap-3"><button className="text-xs font-semibold text-accent" onClick={() => void copyText(item.body, 'Message snippet')}>Copy</button><button className="text-xs font-semibold text-danger" onClick={async () => { await deleteSnippet(item.id); await refreshLibrary(); }}>Delete</button></div></div>)}</div>
          </div>
        </div>}

        {tab === 'settings' && <div className="space-y-4">
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Appearance" />
            <p className="mb-3 mt-2 text-xs text-text-secondary">Choose how CareerPilot looks. System follows your operating system preference.</p>
            <label className={labelClass}>Theme<select className={inputClass} value={theme} onChange={e => void updateTheme(e.target.value as ThemePreference)}><option value="system">System (default)</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          </div>
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Backup and restore" />
            <p className="mt-2 text-xs leading-5 text-text-secondary">Export your profile, documents, saved answers and snippets to a versioned local file.</p>
            <Button className="mt-3 w-full" variant="secondary" onClick={async () => {
              try {
                const blob = await createBackup();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'careerpilot-backup.json';
                link.click();
                URL.revokeObjectURL(url);
                setStatus('Backup exported.');
              } catch (error) {
                setStatus(error instanceof Error ? error.message : 'Backup export failed.');
              }
            }}>Export backup</Button>
            <label className={`${labelClass} mt-3`}>Restore backup
              <input className="mt-2 block w-full text-xs" type="file" accept="application/json,.json" onChange={async e => {
                const file = e.target.files?.[0];
                if (!file || !window.confirm('Restore this backup? Current CareerPilot data will be replaced.')) return;
                try {
                  await restoreBackup(file);
                  setProfile(await getProfile());
                  await refreshLibrary();
                  setStatus('Backup restored successfully.');
                } catch (error) {
                  setStatus(error instanceof Error ? error.message : 'Backup restore failed.');
                }
                e.target.value = '';
              }} />
            </label>
          </div>
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Website access rules" />
            <p className="mt-2 text-xs leading-5 text-text-secondary">One domain or exact IP address per line. Blocklist takes priority. An empty allowlist allows all otherwise-supported HTTP(S) sites.</p>
            <label className={`${labelClass} mt-3`}>Allowlist (optional)<textarea className={`${inputClass} min-h-24 py-2`} value={allowlistText} onChange={e => setAllowlistText(e.target.value)} /></label>
            <label className={`${labelClass} mt-3`}>Blocklist<textarea className={`${inputClass} min-h-24 py-2`} value={blocklistText} onChange={e => setBlocklistText(e.target.value)} /></label>
            <label className="mt-3 flex items-center gap-2 text-xs text-text-secondary"><input type="checkbox" checked={accessRules.includeSubdomains} onChange={e => setAccessRules(current => ({ ...current, includeSubdomains: e.target.checked }))} /> Include subdomains (IP rules always match exactly)</label>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => void persistAccessRules()}>Save website rules</Button>
            <div className="my-4 border-t border-border" />
            <SectionHeader title="Your data and privacy" />
            <p className="mt-2 text-xs leading-5 text-text-secondary">Your profile, documents, saved answers, snippets and appearance preference are stored locally in this browser. CareerPilot has no account, cloud sync or backend.</p>
            <Banner className="mt-3">Clear local data permanently deletes your profile, document library, saved answers and snippets from this browser.</Banner>
            <Button variant="danger" className="mt-3 w-full" onClick={() => void clearAll()}>Clear all local data</Button>
          </div>
        </div>}
        {clipboardFallback && <textarea aria-label="Text ready for manual copying" readOnly value={clipboardFallback} onFocus={event => event.currentTarget.select()} className={`${inputClass} min-h-24 py-2`} />}
        {status && <p className="fixed bottom-16 right-4 z-50 max-w-[min(22rem,calc(100vw-2rem))] rounded-control border border-border bg-card px-4 py-3 text-xs font-medium text-text-primary shadow-lg" role="status" aria-live="polite">{status}</p>}
      </section>
      <footer className="border-t border-border bg-card px-panel py-3 text-center text-[11px] text-text-secondary">You stay in control · Review every suggestion · Submit manually</footer>
    </main>
  );
}
