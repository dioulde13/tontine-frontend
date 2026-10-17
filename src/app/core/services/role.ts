import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Role, UpdateRoleRequest } from '../models';

const BASE_URL = `${environment.apiUrl}/roles`;

/** Reflète RoleController : /api/roles (entièrement public côté backend, cf. SecurityConfig). */
@Service()
export class RoleService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<Role[]>(BASE_URL);
  }

  findById(id: number) {
    return this.http.get<Role>(`${BASE_URL}/${id}`);
  }

  create(dto: UpdateRoleRequest) {
    return this.http.post<Role>(BASE_URL, dto);
  }

  update(id: number, dto: UpdateRoleRequest) {
    return this.http.put<Role>(`${BASE_URL}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
