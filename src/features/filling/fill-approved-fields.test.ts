import { beforeEach, describe, expect, it } from 'vitest';
import { parseHTML } from 'linkedom';
import { fillApprovedFields, type FillTarget } from './fill-approved-fields';

const { document, window } = parseHTML('<html><body></body></html>');
Object.assign(globalThis, { HTMLInputElement: window.HTMLInputElement, HTMLTextAreaElement: window.HTMLTextAreaElement, HTMLSelectElement: window.HTMLSelectElement, Event: window.Event });
const target = (overrides: Partial<FillTarget> = {}): FillTarget => ({
  fieldId: 'email-field', index: 0, tagName: 'input', name: 'email', elementId: 'email',
  controlType: 'text', expectedValue: 'person@example.com', approved: true, ...overrides,
});
describe('fillApprovedFields', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  it('fills an approved empty input and dispatches input/change events', () => {
    document.body.innerHTML = '<input id="email" name="email" type="email">';
    const input = document.querySelector('input')!;
    let inputEvents = 0; let changeEvents = 0;
    input.addEventListener('input', () => inputEvents++); input.addEventListener('change', () => changeEvents++);
    const [result] = fillApprovedFields(document, [target({ controlType: 'email' })]);
    expect(result.status).toBe('filled'); expect(input.value).toBe('person@example.com');
    expect(inputEvents).toBe(1); expect(changeEvents).toBe(1);
  });
  it('does not fill unapproved fields', () => {
    document.body.innerHTML = '<input id="email" name="email">';
    expect(fillApprovedFields(document, [target({ approved: false })])[0].status).toBe('not-approved');
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('');
  });
  it('keeps an existing different value unless replacement is explicitly approved', () => {
    document.body.innerHTML = '<input id="email" name="email" value="site@example.com">';
    expect(fillApprovedFields(document, [target()])[0].status).toBe('conflict');
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('site@example.com');
    expect(fillApprovedFields(document, [target({ replaceExisting: true })])[0].status).toBe('filled');
  });
  it('reports matching values as already filled', () => {
    document.body.innerHTML = '<input id="email" name="email" value="person@example.com">';
    expect(fillApprovedFields(document, [target()])[0].status).toBe('already-filled');
  });
  it('rejects stale targets after a page rerender', () => {
    document.body.innerHTML = '<input id="different" name="other">';
    expect(fillApprovedFields(document, [target()])[0].status).toBe('stale');
  });
  it('rejects a control whose type changed after scanning', () => {
    document.body.innerHTML = '<input id="email" name="email" type="password">';
    expect(fillApprovedFields(document, [target()])[0].status).toBe('stale');
  });

  it('never fills sensitive controls', () => {
    document.body.innerHTML = '<input id="otp" name="otp" type="text">';
    expect(fillApprovedFields(document, [target({ elementId: 'otp', name: 'otp' })])[0].status).toBe('unsupported');
  });
  it('selects only an existing enabled native option', () => {
    document.body.innerHTML = '<select id="email" name="email"><option value="">Choose</option><option value="yes">Yes</option><option value="no" disabled>No</option></select>';
    expect(fillApprovedFields(document, [target({ tagName: 'select', controlType: 'select', expectedValue: 'yes' })])[0].status).toBe('filled');
    (document.querySelector('option[value="no"]') as HTMLOptionElement).disabled = true;
    expect(fillApprovedFields(document, [target({ tagName: 'select', controlType: 'select', expectedValue: 'no' })])[0].status).toBe('unsupported');
  });
  it('does not use an index if the target identity changed', () => {
    document.body.innerHTML = '<input id="other" name="other"><input id="email" name="email">';
    expect(fillApprovedFields(document, [target()])[0].status).toBe('stale');
  });
  it('does not submit a form while filling approved fields', () => {
    document.body.innerHTML = '<form><input id="email" name="email"></form>';
    let submits = 0;
    document.querySelector('form')!.addEventListener('submit', event => { event.preventDefault(); submits++; });
    expect(fillApprovedFields(document, [target()])[0].status).toBe('filled');
    expect(submits).toBe(0);
  });
  it('requires explicit per-field replacement approval', () => {
    document.body.innerHTML = '<input id="email" name="email" value="site@example.com"><input id="other" name="other" value="keep">';
    const first = fillApprovedFields(document, [target({ replaceExisting: true })])[0];
    expect(first.status).toBe('filled');
    expect((document.querySelector('#other') as HTMLInputElement).value).toBe('keep');
  });

});
