import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth';

/**
 * provideAppInitializer (app.config.ts) attend la fin de AuthService.restoreSession() avant que
 * le routeur ne résolve la première navigation : currentUser est donc déjà à jour ici.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
