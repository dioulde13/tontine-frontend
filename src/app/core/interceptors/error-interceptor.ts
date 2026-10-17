import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth';
import { SKIP_ERROR_TOAST } from '../http/http-context-tokens';
import { ApiError } from '../models';
import { NotificationService } from '../services/notification';

/**
 * Centralise la traduction des erreurs HTTP en messages compréhensibles (section 24 du cahier des
 * charges). GlobalExceptionHandler côté backend renvoie toujours un ApiError avec un "message" déjà
 * rédigé pour un humain (ex: "Impossible de supprimer : des données liées existent encore...") :
 * on l'affiche directement plutôt que de ré-interpréter le code HTTP.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);

  const isLoginRequest = req.url.endsWith('/auth/login');

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (err.status === 0) {
        notifications.error('Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.');
        return throwError(() => err);
      }

      if (err.status === 401 && !isLoginRequest) {
        notifications.warning('Votre session a expiré. Veuillez vous reconnecter.');
        auth.logout();
        return throwError(() => err);
      }

      // Le login géré par le composant lui-même (message inline sous le formulaire).
      if (isLoginRequest || req.context.get(SKIP_ERROR_TOAST)) {
        return throwError(() => err);
      }

      const body = err.error as ApiError | null;
      const message = body?.message || defaultMessageFor(err.status);
      notifications.error(message);

      return throwError(() => err);
    }),
  );
};

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return 'La requête envoyée est invalide.';
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
    case 404:
      return "La ressource demandée n'existe pas.";
    case 409:
      return 'Cette action entre en conflit avec les données existantes.';
    case 422:
      return 'Les données envoyées ne sont pas valides.';
    case 429:
      return 'Trop de requêtes. Merci de réessayer dans un instant.';
    case 503:
      return 'Le service est momentanément indisponible.';
    default:
      return 'Une erreur interne est survenue. Merci de réessayer.';
  }
}
