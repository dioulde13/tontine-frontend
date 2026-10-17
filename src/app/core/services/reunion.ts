import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreateReunionRequest, Reunion } from '../models';

/** Reflète VillageReunionController : /api/villages/{villageId}/reunions. */
@Service()
export class ReunionService {
  private readonly http = inject(HttpClient);

  findByVillage(villageId: number) {
    return this.http.get<Reunion[]>(`${environment.apiUrl}/villages/${villageId}/reunions`);
  }

  create(villageId: number, dto: CreateReunionRequest) {
    return this.http.post<Reunion>(`${environment.apiUrl}/villages/${villageId}/reunions`, dto);
  }

  delete(villageId: number, reunionId: number) {
    return this.http.delete<void>(`${environment.apiUrl}/villages/${villageId}/reunions/${reunionId}`);
  }
}
