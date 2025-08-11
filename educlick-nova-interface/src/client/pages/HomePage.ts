import { HomeTemplate } from '../templates/HomeTemplate';

export async function renderHomePage(root: HTMLElement): Promise<void> {
  root.innerHTML = HomeTemplate.render();
} 