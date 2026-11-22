import { describe, expect, it, vi } from 'vitest';
import { writePlainText } from './clipboard';

describe('writePlainText', () => {
  it('preserves leading, trailing, repeated whitespace and line breaks exactly', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const value = '  Hello   there  \n\n  Second paragraph\t ';
    await writePlainText(value, { writeText });
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith(value);
  });
});
