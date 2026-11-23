export interface RequiredFieldCandidate {
  controlType: string;
  required: boolean;
  currentValue: string;
  label?: string;
  name?: string;
  elementId?: string;
  placeholder?: string;
}

const DOCUMENT_UPLOAD_LABEL = /\b(resume|résumé|cv|curriculum vitae)\b/i;

/** Document upload controls are validated by the attachment flow, not text-value validation. */
export function isDocumentUploadField(field: RequiredFieldCandidate): boolean {
  return field.controlType.toLowerCase() === 'file' ||
    DOCUMENT_UPLOAD_LABEL.test([
      field.label,
      field.name,
      field.elementId,
      field.placeholder,
    ].filter(Boolean).join(' ').replace(/[_-]+/g, ' '));
}

export function isMissingRequiredTextValue(
  field: RequiredFieldCandidate,
  suggestedValue: string,
): boolean {
  if (!field.required || isDocumentUploadField(field) || field.currentValue.trim()) {
    return false;
  }
  return !suggestedValue.trim();
}
