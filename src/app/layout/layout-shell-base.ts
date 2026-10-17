import { signal } from '@angular/core';

const COLLAPSED_KEY = 'cotisation.sidebar.collapsed';

/**
 * Logique commune aux trois layouts (admin/président/membre) : état du drawer mobile et de la
 * réduction de la sidebar sur desktop. Chaque layout garde son propre template/sections de nav
 * (section 26 : partager les composants réutilisables, pas dupliquer trois applications).
 */
export abstract class LayoutShellBase {
  readonly mobileOpen = signal(false);
  readonly collapsed = signal(this.readCollapsedPreference());

  toggleCollapse(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      /* préférence non persistée, sans conséquence fonctionnelle */
    }
  }

  private readCollapsedPreference(): boolean {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
