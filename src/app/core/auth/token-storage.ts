const TOKEN_KEY = 'cotisation.auth.token';

/**
 * Accès bas niveau au token JWT persistant. Séparé d'AuthService pour que l'intercepteur HTTP
 * puisse lire le token sans dépendre d'un service qui lui-même utilise HttpClient.
 */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* stockage indisponible (navigation privée...) : la session ne survivra pas au rechargement */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* rien à faire */
    }
  },
};
