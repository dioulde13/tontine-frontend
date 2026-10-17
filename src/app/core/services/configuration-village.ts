import { HttpClient, HttpContext } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ConfigurationVillage, UpdateConfigurationVillageRequest } from '../models';
import { SKIP_ERROR_TOAST } from '../http/http-context-tokens';

/** Reflète VillageConfigurationController : /api/villages/{villageId}/configuration (POST, GET, PUT). */
@Service()
export class ConfigurationVillageService {
  private readonly http = inject(HttpClient);

  /**
   * "Pas encore configuré" (404) est un résultat normal ici, pas une erreur à afficher en toast :
   * on le signale via SKIP_ERROR_TOAST, le composant appelant décide lui-même quoi en faire.
   */
  findByVillage(villageId: number) {
    return this.http.get<ConfigurationVillage>(`${environment.apiUrl}/villages/${villageId}/configuration`, {
      context: new HttpContext().set(SKIP_ERROR_TOAST, true),
    });
  }

  /** Création initiale, une seule fois (contrainte unique en base). */
  create(villageId: number, dto: UpdateConfigurationVillageRequest) {
    return this.http.post<ConfigurationVillage>(
      `${environment.apiUrl}/villages/${villageId}/configuration`,
      dto,
    );
  }

  /** Modifie la configuration existante (404 si elle n'a pas encore été créée). */
  update(villageId: number, dto: UpdateConfigurationVillageRequest) {
    return this.http.put<ConfigurationVillage>(
      `${environment.apiUrl}/villages/${villageId}/configuration`,
      dto,
    );
  }
}
