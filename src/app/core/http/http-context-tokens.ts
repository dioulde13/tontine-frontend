import { HttpContextToken } from '@angular/common/http';

/**
 * Permet à un appel précis de ne pas déclencher le toast d'erreur global (errorInterceptor) —
 * utile quand le composant appelant sait qu'un statut d'erreur (ex: 404) est un résultat normal
 * qu'il va lui-même traduire en état d'interface (ex: "configuration non créée encore").
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
