import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreatePenaliteManuelleRequest, Penalite } from '../models';

/** Reflète VillagePenaliteController : /api/villages/{villageId}/penalites. */
@Service()
export class PenaliteService {
  private readonly http = inject(HttpClient);

  findByVillage(villageId: number) {
    return this.http.get<Penalite[]>(`${environment.apiUrl}/villages/${villageId}/penalites`);
  }

  /** Le backend refuse (400) toute création manuelle avec un type autre que AUTRE. */
  create(villageId: number, dto: CreatePenaliteManuelleRequest) {
    return this.http.post<Penalite>(`${environment.apiUrl}/villages/${villageId}/penalites`, dto);
  }

  delete(villageId: number, penaliteId: number) {
    return this.http.delete<void>(`${environment.apiUrl}/villages/${villageId}/penalites/${penaliteId}`);
  }

  payer(villageId: number, penaliteId: number) {
    return this.http.post<Penalite>(
      `${environment.apiUrl}/villages/${villageId}/penalites/${penaliteId}/payer`,
      {},
    );
  }
}
