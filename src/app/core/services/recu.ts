import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreateRecuRequest, Recu } from '../models';

/** Reflète VillageRecuController : /api/villages/{villageId}/recus. */
@Service()
export class RecuService {
  private readonly http = inject(HttpClient);

  findByVillage(villageId: number) {
    return this.http.get<Recu[]>(`${environment.apiUrl}/villages/${villageId}/recus`);
  }

  findOne(villageId: number, recuId: number) {
    return this.http.get<Recu>(`${environment.apiUrl}/villages/${villageId}/recus/${recuId}`);
  }

  create(villageId: number, dto: CreateRecuRequest) {
    return this.http.post<Recu>(`${environment.apiUrl}/villages/${villageId}/recus`, dto);
  }
}
