import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreatePresenceRequest, Presence } from '../models';

/** Reflète VillageReunionPresenceController : /api/villages/{villageId}/reunion/{reunionId}/presences. */
@Service()
export class PresenceService {
  private readonly http = inject(HttpClient);

  private base(villageId: number, reunionId: number): string {
    return `${environment.apiUrl}/villages/${villageId}/reunion/${reunionId}/presences`;
  }

  create(villageId: number, reunionId: number, dto: CreatePresenceRequest) {
    return this.http.post<Presence>(this.base(villageId, reunionId), dto);
  }

  findPresents(villageId: number, reunionId: number) {
    return this.http.get<Presence[]>(`${this.base(villageId, reunionId)}/present`);
  }

  findAbsents(villageId: number, reunionId: number) {
    return this.http.get<Presence[]>(`${this.base(villageId, reunionId)}/Absent`);
  }

  delete(villageId: number, reunionId: number, presenceId: number) {
    return this.http.delete<void>(`${this.base(villageId, reunionId)}/${presenceId}`);
  }
}
