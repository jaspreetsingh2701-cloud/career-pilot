import { emptyProfile, type UserProfile } from './types';
const KEY = 'careerPilot.profile';
export async function getProfile(): Promise<UserProfile> {
  const result = await chrome.storage.local.get(KEY);
  return (result[KEY] as UserProfile | undefined) ?? emptyProfile();
}
export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const next = { ...profile, updatedAt: Date.now() };
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}
export async function clearProfile(): Promise<void> {
  await chrome.storage.local.remove(KEY);
}
