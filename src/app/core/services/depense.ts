import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreateDepenseRequest, Depense } from '../models';

/** Reflète VillageDepenseController : /api/villages/{villageId}/depenses. */
@Service()
export class DepenseService {
  private readonly http = inject(HttpClient);

  findByVillage(villageId: number) {
    return this.http.get<Depense[]>(`${environment.apiUrl}/villages/${villageId}/depenses`);
  }

  findOne(villageId: number, depenseId: number) {
    return this.http.get<Depense>(`${environment.apiUrl}/villages/${villageId}/depenses/${depenseId}`);
  }

  create(villageId: number, dto: CreateDepenseRequest) {
    return this.http.post<Depense>(`${environment.apiUrl}/villages/${villageId}/depenses`, dto);
  }

  delete(villageId: number, depenseId: number) {
    return this.http.delete<void>(`${environment.apiUrl}/villages/${villageId}/depenses/${depenseId}`);
  }
}
