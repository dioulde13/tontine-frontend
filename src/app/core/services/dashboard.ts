import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AdminDashboard, MembreCotisations, MembreDashboard, PresidentDashboard } from '../models';
import { SKIP_ERROR_TOAST } from '../http/http-context-tokens';

/**
 * Reflète les 3 nouveaux endpoints dashboard côté backend :
 * AdminDashboardController, VillageDashboardController, MembreDashboardController.
 */
@Service()
export class DashboardService {
  private readonly http = inject(HttpClient);

  getAdminDashboard() {
    return this.http.get<AdminDashboard>(`${environment.apiUrl}/admin/dashboard`);
  }

  getPresidentDashboard(villageId: number) {
    return this.http.get<PresidentDashboard>(`${environment.apiUrl}/villages/${villageId}/dashboard`);
  }

  /**
   * 400 si le membre connecté n'a pas encore de village assigné (UtilisateurSansVillageException) :
   * un résultat normal à gérer dans l'UI, pas une erreur à afficher en toast.
   */
  getMembreDashboard() {
    return this.http.get<MembreDashboard>(`${environment.apiUrl}/membres/moi/dashboard`, {
      context: new HttpContext().set(SKIP_ERROR_TOAST, true),
    });
  }

  /**
   * annee : année sur laquelle calculer les mois impayés (défaut = année courante côté backend).
   * 400 si le membre connecté n'a pas encore de village assigné (UtilisateurSansVillageException) :
   * un résultat normal à gérer dans l'UI, pas une erreur à afficher en toast.
   */
  getMembreCotisations(annee?: number) {
    return this.http.get<MembreCotisations>(`${environment.apiUrl}/membres/moi/cotisations`, {
      params: annee ? new HttpParams().set('annee', annee) : undefined,
      context: new HttpContext().set(SKIP_ERROR_TOAST, true),
    });
  }
}
