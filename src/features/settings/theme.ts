export type ThemePreference = 'light' | 'dark' | 'system';
const KEY = 'careerPilot.theme';
export async function getThemePreference(): Promise<ThemePreference> {
  const result = await chrome.storage.local.get(KEY);
  const value = result[KEY];
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}
export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  await chrome.storage.local.set({ [KEY]: theme });
}
