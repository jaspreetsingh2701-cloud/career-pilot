import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { Banner } from '../../src/components/common/Banner';
import { Button } from '../../src/components/common/Button';
import { SectionHeader } from '../../src/components/common/SectionHeader';
import { getProfile, saveProfile } from '../../src/features/profile/repository';
import { emptyProfile, type UserProfile } from '../../src/features/profile/types';
import { addDocument, clearLibrary, deleteAnswer, deleteDocument, deleteSnippet, listAnswers, listDocuments, listSnippets, saveAnswer, saveSnippet, setDefaultDocument } from '../../src/features/library/database';
import type { CareerDocument, DocumentType, SavedAnswer } from '../../src/features/library/types';
import { createBackup, restoreBackup } from '../../src/features/backup/backup';
import { getThemePreference, saveThemePreference, type ThemePreference } from '../../src/features/settings/theme';

type Tab = 'profile' | 'documents' | 'answers' | 'settings';
const inputClass = 'mt-1 min-h-11 w-full rounded-control border border-border-input bg-card px-3 text-sm text-text-primary placeholder:text-text-secondary';
const labelClass = 'block text-xs font-semibold text-text-secondary';
const newId = () => crypto.randomUUID();

export default function App() {
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<UserProfile>(emptyProfile());
  const [documents, setDocuments] = useState<CareerDocument[]>([]);
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [snippets, setSnippets] = useState<MessageSnippet[]>([]);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [documentType, setDocumentType] = useState<DocumentType>('resume');
  const [status, setStatus] = useState('Your information stays on this device.');
  const [busy, setBusy] = useState(false);
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerBody, setAnswerBody] = useState('');
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetBody, setSnippetBody] = useState('');

  async function refreshLibrary() {
    const [docs, savedAnswers, savedSnippets] = await Promise.all([listDocuments(), listAnswers(), listSnippets()]);
    setDocuments(docs); setAnswers(savedAnswers); setSnippets(savedSnippets);
  }
  useEffect(() => {
    void Promise.all([getProfile(), getThemePreference()]).then(([p, t]) => { setProfile(p); setTheme(t); });
    void refreshLibrary();
  }, []);
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
    try { setProfile(await saveProfile(profile)); setStatus('Profile saved locally.'); }
    catch { setStatus('Could not save your profile. Please try again.'); }
    finally { setBusy(false); }
  }
  async function uploadDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await addDocument(file, file.name.toLowerCase().endsWith('pdf') || /\.(doc|docx)$/i.test(file.name) ? (tab === 'documents' ? 'resume' : 'other') : 'other');
      await refreshLibrary(); setStatus('Document imported to local storage.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Document import failed.'); }
    event.target.value = '';
  }
  async function addSavedAnswer() {
    if (!answerTitle.trim() || !answerBody.trim()) return;
    const now = Date.now();
    await saveAnswer({ id: newId(), title: answerTitle.trim(), answer: answerBody, keywords: [], createdAt: now, updatedAt: now });
    setAnswerTitle(''); setAnswerBody(''); await refreshLibrary(); setStatus('Saved answer added.');
  }
  async function addMessageSnippet() {
    if (!snippetTitle.trim() || !snippetBody.trim()) return;
    const now = Date.now();
    await saveSnippet({ id: newId(), title: snippetTitle.trim(), body: snippetBody, createdAt: now, updatedAt: now });
    setSnippetTitle(''); setSnippetBody(''); await refreshLibrary(); setStatus('Message snippet added.');
  }
  async function updateTheme(value: ThemePreference) { setTheme(value); await saveThemePreference(value); }
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
          {(['profile', 'documents', 'answers', 'settings'] as Tab[]).map(item => <button key={item} onClick={() => setTab(item)} className={`min-h-10 rounded-control px-1 text-xs font-semibold capitalize ${tab === item ? 'bg-accent text-white' : 'bg-muted text-text-secondary'}`} aria-current={tab === item ? 'page' : undefined}>{item}</button>)}
        </nav>
      </header>

      <section className="flex-1 space-y-4 p-panel">
        {tab === 'profile' && <div className="rounded-card border border-border bg-card p-card">
          <SectionHeader title="Candidate profile" />
          <p className="mb-4 mt-2 text-xs leading-5 text-text-secondary">Add only information you want to reuse in job applications. Optional fields can stay empty.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>First name<input className={inputClass} value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} /></label>
            <label className={labelClass}>Last name<input className={inputClass} value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} /></label>
          </div>
          <label className={`${labelClass} mt-3`}>Email<input type="email" className={inputClass} value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></label>
          <label className={`${labelClass} mt-3`}>Phone<input className={inputClass} value={profile.phone ?? ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></label>
          <label className={`${labelClass} mt-3`}>Current location<input className={inputClass} value={profile.currentLocation ?? ''} onChange={e => setProfile({ ...profile, currentLocation: e.target.value })} /></label>
          <label className={`${labelClass} mt-3`}>Current designation<input className={inputClass} value={profile.currentDesignation ?? ''} onChange={e => setProfile({ ...profile, currentDesignation: e.target.value })} /></label>
          <label className={`${labelClass} mt-3`}>Current company<input className={inputClass} value={profile.currentCompany ?? ''} onChange={e => setProfile({ ...profile, currentCompany: e.target.value })} /></label>
          <label className={`${labelClass} mt-3`}>Preferred role<input className={inputClass} value={profile.preferredRole ?? ''} onChange={e => setProfile({ ...profile, preferredRole: e.target.value })} /></label>
          <Button className="mt-4 w-full" onClick={persistProfile} disabled={busy || !profile.firstName.trim() || !profile.email.trim()}>{busy ? 'Saving…' : 'Save profile'}</Button>
        </div>}

        {tab === 'documents' && <div className="rounded-card border border-border bg-card p-card">
          <SectionHeader title="Document library" count={documents.length} />
          <p className="mb-3 mt-2 text-xs leading-5 text-text-secondary">Import PDF, DOC or DOCX files up to 5 MB. Files are stored in this browser only.</p>
          <label className={labelClass}>Document type<select className={inputClass} value={documentType} onChange={e => setDocumentType(e.target.value as DocumentType)}><option value="resume">Resume</option><option value="cover-letter">Cover letter</option><option value="other">Other</option></select></label><label className="mt-3 block text-xs font-semibold text-text-secondary">Import document<input type="file" accept=".pdf,.doc,.docx" onChange={uploadDocument} className="mt-2 block w-full text-xs file:mr-2 file:min-h-10 file:rounded-control file:border-0 file:bg-accent file:px-3 file:text-white" /></label>
          <div className="mt-4 space-y-2">{documents.map(doc => <div key={doc.id} className="rounded-control border border-border p-3">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="break-words text-xs font-semibold">{doc.name}</p><p className="mt-1 text-[11px] text-text-secondary">{doc.fileName} · {(doc.sizeBytes / 1024).toFixed(0)} KB</p></div>{doc.isDefault && <span className="shrink-0 rounded-full bg-success-bg px-2 py-1 text-[10px] font-semibold text-success">Default</span>}</div>
            <div className="mt-2 flex gap-2">{doc.type !== 'other' && !doc.isDefault && <button className="text-xs font-semibold text-accent" onClick={async () => { await setDefaultDocument(doc.id, doc.type); await refreshLibrary(); }}>Set default</button>}<button className="text-xs font-semibold text-danger" onClick={async () => { if (window.confirm('Delete this document?')) { await deleteDocument(doc.id); await refreshLibrary(); } }}>Delete</button></div>
          </div>)}</div>
          {documents.length === 0 && <p className="mt-4 text-xs text-text-secondary">No documents yet. Import your first resume or cover letter.</p>}
        </div>}

        {tab === 'answers' && <div className="space-y-4">
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Saved answers" count={answers.length} />
            <label className={`${labelClass} mt-3`}>Title<input className={inputClass} value={answerTitle} onChange={e => setAnswerTitle(e.target.value)} placeholder="e.g. Why are you interested?" /></label>
            <label className={`${labelClass} mt-3`}>Answer<textarea className={`${inputClass} min-h-24 py-2`} value={answerBody} onChange={e => setAnswerBody(e.target.value)} /></label>
            <Button className="mt-3 w-full" onClick={addSavedAnswer}>Add saved answer</Button>
            <div className="mt-3 space-y-2">{answers.map(item => <div key={item.id} className="rounded-control border border-border p-3"><p className="text-xs font-semibold">{item.title}</p><p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">{item.answer}</p><button className="mt-2 text-xs font-semibold text-danger" onClick={async () => { await deleteAnswer(item.id); await refreshLibrary(); }}>Delete</button></div>)}</div>
          </div>
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Message snippets" count={snippets.length} />
            <label className={`${labelClass} mt-3`}>Title<input className={inputClass} value={snippetTitle} onChange={e => setSnippetTitle(e.target.value)} placeholder="e.g. Recruiter follow-up" /></label>
            <label className={`${labelClass} mt-3`}>Message<textarea className={`${inputClass} min-h-24 py-2`} value={snippetBody} onChange={e => setSnippetBody(e.target.value)} /></label>
            <Button className="mt-3 w-full" onClick={addMessageSnippet}>Add snippet</Button>
            <div className="mt-3 space-y-2">{snippets.map(item => <div key={item.id} className="rounded-control border border-border p-3"><p className="text-xs font-semibold">{item.title}</p><p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">{item.body}</p><div className="mt-2 flex gap-3"><button className="text-xs font-semibold text-accent" onClick={() => void navigator.clipboard.writeText(item.body).then(() => setStatus('Snippet copied as plain text.')).catch(() => setStatus('Clipboard unavailable in this context.'))}>Copy</button><button className="text-xs font-semibold text-danger" onClick={async () => { await deleteSnippet(item.id); await refreshLibrary(); }}>Delete</button></div></div>)}</div>
          </div>
        </div>}

        {tab === 'settings' && <div className="space-y-4">
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Appearance" />
            <p className="mb-3 mt-2 text-xs text-text-secondary">Choose how CareerPilot looks. System follows your operating system preference.</p>
            <label className={labelClass}>Theme<select className={inputClass} value={theme} onChange={e => void updateTheme(e.target.value as ThemePreference)}><option value="system">System (default)</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          </div>
          <div className="rounded-card border border-border bg-card p-card">
            <SectionHeader title="Your data and privacy" />
            <p className="mt-2 text-xs leading-5 text-text-secondary">Your profile, documents, saved answers, snippets and appearance preference are stored locally in this browser. CareerPilot has no account, cloud sync or backend.</p>
            <Banner className="mt-3">Clear local data permanently deletes your profile, document library, saved answers and snippets from this browser.</Banner>
            <Button variant="danger" className="mt-3 w-full" onClick={() => void clearAll()}>Clear all local data</Button>
          </div>
        </div>}
        <p className="rounded-control bg-muted p-3 text-xs text-text-secondary" role="status" aria-live="polite">{status}</p>
      </section>
      <footer className="border-t border-border bg-card px-panel py-3 text-center text-[11px] text-text-secondary">You stay in control · Review every suggestion · Submit manually</footer>
    </main>
  );
}
