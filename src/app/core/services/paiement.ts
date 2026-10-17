import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreatePaiementRequest, Paiement } from '../models';

/** Reflète VillagePaiementController : /api/villages/{villageId}/paiements. */
@Service()
export class PaiementService {
  private readonly http = inject(HttpClient);

  findByVillage(villageId: number) {
    return this.http.get<Paiement[]>(`${environment.apiUrl}/villages/${villageId}/paiements`);
  }

  /** Peut renvoyer plusieurs paiements : un par mois choisi dans dto.mois. */
  create(villageId: number, dto: CreatePaiementRequest) {
    return this.http.post<Paiement[]>(`${environment.apiUrl}/villages/${villageId}/paiements`, dto);
  }

  delete(villageId: number, paiementId: number) {
    return this.http.delete<void>(`${environment.apiUrl}/villages/${villageId}/paiements/${paiementId}`);
  }
}
