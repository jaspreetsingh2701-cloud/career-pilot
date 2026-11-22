export interface FillTarget {
  fieldId: string;
  index: number;
  tagName: string;
  name?: string;
  elementId?: string;
  controlType: string;
  expectedValue: string;
  approved: boolean;
  replaceExisting?: boolean;
}
export type FillStatus = 'filled' | 'already-filled' | 'conflict' | 'stale' | 'unsupported' | 'failed' | 'not-approved';
export interface FillResult { fieldId: string; status: FillStatus; message: string; }
const SENSITIVE = /password|one.?time|otp|verification.?code|security.?code|credit.?card|card.?number|cvv|cvc|bank|routing|ssn|social.?security|passport|national.?id|work.?authorization|gender|ethnicity|race|disability|veteran|consent|attest/i;
const EXCLUDED_TYPES = new Set(['hidden','password','submit','button','reset','image','file']);
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
function isSensitive(el: HTMLElement & { name?: string; type?: string; id?: string; autocomplete?: string }): boolean {
  return EXCLUDED_TYPES.has((el.getAttribute('type') ?? el.type ?? '').toLowerCase()) ||
    SENSITIVE.test([el.name,el.id,el.getAttribute('autocomplete'),el.getAttribute('aria-label')].filter(Boolean).join(' '));
}
function currentValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) return String(el.checked);
  return el.value;
}
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype :
    el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value); else el.value = value;
}
export function fillApprovedFields(root: ParentNode, targets: FillTarget[]): FillResult[] {
  const elements = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select'));
  return targets.map(target => {
    if (!target.approved) return { fieldId: target.fieldId, status: 'not-approved', message: 'This field was not approved.' };
    const el = elements[target.index];
    const liveControlType = !el ? undefined : el instanceof HTMLInputElement ? (el.getAttribute('type') ?? 'text').toLowerCase() : el.tagName.toLowerCase();
    if (!el || el.tagName.toLowerCase() !== target.tagName || liveControlType !== target.controlType ||
      (target.elementId && el.id !== target.elementId) || (target.name && el.name !== target.name)) {
      return { fieldId: target.fieldId, status: 'stale', message: 'The field changed after scanning. Re-scan before filling.' };
    }
    if (el.disabled || ('readOnly' in el && el.readOnly) || isSensitive(el)) {
      return { fieldId: target.fieldId, status: 'unsupported', message: 'This field is protected or unsupported.' };
    }
    const current = currentValue(el);
    const desired = target.expectedValue;
    const isEmpty = el instanceof HTMLSelectElement
      ? !el.value || el.selectedOptions[0]?.disabled === true
      : el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')
        ? !el.checked
        : !current.trim();
    if (!isEmpty && normalize(current) === normalize(desired)) {
      return { fieldId: target.fieldId, status: 'already-filled', message: 'The field already has the requested value.' };
    }
    if (!isEmpty && !target.replaceExisting) {
      return { fieldId: target.fieldId, status: 'conflict', message: 'The site already has a different value. It was kept unchanged.' };
    }
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
      if (desired !== 'true' && desired !== 'false') return { fieldId: target.fieldId, status: 'unsupported', message: 'Boolean controls require an explicit true/false value.' };
      el.checked = desired === 'true';
    } else {
      if (el instanceof HTMLSelectElement) {
        const option = Array.from(el.options).find(item => !item.disabled && item.value === desired);
        if (!option) return { fieldId: target.fieldId, status: 'unsupported', message: 'The approved option is no longer available.' };
      }
      if (el instanceof HTMLSelectElement) {
        for (const item of Array.from(el.options)) item.selected = item.value === desired;
      } else {
        setNativeValue(el, desired);
      }
    }
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return { fieldId: target.fieldId, status: 'filled', message: 'Value entered; verify it on the page.' };
  });
}
