import { describe, expect, it } from 'vitest';
import { isDocumentUploadField, isMissingRequiredTextValue } from './required-field-validation';

describe('required field validation', () => {
  it('does not require a text value for native file inputs', () => {
    expect(isMissingRequiredTextValue({ controlType: 'file', required: true, currentValue: '', label: 'Resume' }, '')).toBe(false);
  });

  it('recognizes Resume fields even when a portal exposes them as non-file controls', () => {
    expect(isDocumentUploadField({ controlType: 'text', required: true, currentValue: '', label: 'Resume' })).toBe(true);
    expect(isDocumentUploadField({ controlType: 'button', required: true, currentValue: '', name: 'cv_upload' })).toBe(true);
    expect(isMissingRequiredTextValue({ controlType: 'text', required: true, currentValue: '', label: 'Resume' }, '')).toBe(false);
  });

  it('still blocks genuinely missing required text fields', () => {
    expect(isMissingRequiredTextValue({ controlType: 'text', required: true, currentValue: '', label: 'First name' }, '')).toBe(true);
  });

  it('allows required text fields with a current or suggested value', () => {
    expect(isMissingRequiredTextValue({ controlType: 'text', required: true, currentValue: 'Jaspreet', label: 'First name' }, '')).toBe(false);
    expect(isMissingRequiredTextValue({ controlType: 'text', required: true, currentValue: '', label: 'First name' }, 'Jaspreet')).toBe(false);
  });
});
