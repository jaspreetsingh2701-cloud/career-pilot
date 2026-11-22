import { afterEach, describe, expect, it, vi } from 'vitest';
import { getThemePreference, saveThemePreference } from './theme';

afterEach(() => vi.unstubAllGlobals());

describe('theme preference', () => {
  it('defaults to system when no preference has been saved', async () => {
    vi.stubGlobal('chrome', { storage: { local: { get: vi.fn().mockResolvedValue({}) } } });
    await expect(getThemePreference()).resolves.toBe('system');
  });

  it('falls back to system for an unknown stored value', async () => {
    vi.stubGlobal('chrome', { storage: { local: { get: vi.fn().mockResolvedValue({ 'careerPilot.theme': 'sepia' }) } } });
    await expect(getThemePreference()).resolves.toBe('system');
  });

  it('persists an explicit theme selection locally', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('chrome', { storage: { local: { set } } });
    await saveThemePreference('dark');
    expect(set).toHaveBeenCalledWith({ 'careerPilot.theme': 'dark' });
  });
});
