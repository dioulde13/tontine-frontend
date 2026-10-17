import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from './auth';

/**
 * Garde UX (section 25 du cahier des charges) : le backend n'impose aucune restriction de rôle sur
 * la plupart de ses routes (seule l'appartenance "président gère ce village" est vérifiée côté
 * serveur, via VillageAccessService). Ce guard sert uniquement à présenter la bonne navigation à
 * chaque rôle — jamais un mécanisme de sécurité en soi.
 */
export function roleGuard(roles: readonly string[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasAnyRole(roles)) {
      return true;
    }
    return router.createUrlTree([auth.urlAtterrissage()]);
  };
}
