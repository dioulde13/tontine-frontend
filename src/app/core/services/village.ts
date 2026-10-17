import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UpdateVillageRequest, Village } from '../models';

const BASE_URL = `${environment.apiUrl}/villages`;

/** Reflète VillageController : /api/villages. */
@Service()
export class VillageService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<Village[]>(BASE_URL);
  }

  findById(id: number) {
    return this.http.get<Village>(`${BASE_URL}/${id}`);
  }

  create(dto: UpdateVillageRequest) {
    return this.http.post<Village>(BASE_URL, dto);
  }

  update(id: number, dto: UpdateVillageRequest) {
    return this.http.put<Village>(`${BASE_URL}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
