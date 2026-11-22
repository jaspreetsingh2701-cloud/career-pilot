import { describe, expect, it } from 'vitest';
import { formatLabel } from './format-label';

describe('formatLabel', () => {
  it('formats camel case and separators', () => expect(formatLabel('workAuthorization_status')).toBe('Work Authorization Status'));
  it('trims surrounding whitespace', () => expect(formatLabel('  first-name  ')).toBe('First Name'));
});
