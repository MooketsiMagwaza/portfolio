/** Things more than one surface can do (menus, Spotlight, Terminal). */
import { profile } from '@/data/site';
import { openProject } from './finder';
import { copyText, openExternal } from './lib';
import { notify } from './notify';
import { toggleTheme } from './theme';
import { openApp } from './windows';

export { openApp, openProject, toggleTheme };

export async function copyToClipboard(text: string, label: string): Promise<void> {
  const ok = await copyText(text);
  notify({
    title: ok ? 'Copied' : 'Couldn’t copy',
    body: ok ? `${label} is on your clipboard.` : `Please copy it manually: ${text}`,
    icon: 'contacts',
    timeout: 3200,
  });
}

export const copyEmail = (): Promise<void> => copyToClipboard(profile.email, 'My email address');
export const copyGitHub = (): Promise<void> => copyToClipboard(profile.github, 'My GitHub URL');
export const emailMe = (): void => {
  window.location.href = `mailto:${profile.email}`;
};
export const openGitHub = (): void => openExternal(profile.github);
export const openSource = (): void => openExternal(profile.sourceRepo);

export function showCredits(): void {
  openApp('about');
  document.dispatchEvent(new CustomEvent('about:tab', { detail: 'credits' }));
}
