import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { tokenStorage } from '../auth/token-storage';

/** Ajoute "Authorization: Bearer <token>" sur chaque appel vers notre API, si un token existe. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = tokenStorage.get();
  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
