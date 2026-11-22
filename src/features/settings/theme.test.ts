import { describe, expect, it } from 'vitest';
import { getThemePreference } from './theme';
describe('theme preference defaults', () => {
  it('uses system as the default when no preference exists', async () => {
    const original = globalThis.chrome;
    Object.defineProperty(globalThis, 'chrome', { configurable: true, value: { storage: { local: { get: async () => ({}) } } } });
    await expect(getThemePreference()).resolves.toBe('system');
    Object.defineProperty(globalThis, 'chrome', { configurable: true, value: original });
  });
});
