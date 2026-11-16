import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { TypeMouvementCaisse, UpdateTypeMouvementCaisseRequest } from '../models';

/** Reflète VillageTypeMouvementCaisseController : /api/villages/{villageId}/types-depenses. */
@Service()
export class TypeMouvementCaisseService {
  private readonly http = inject(HttpClient);

  findByVillage(villageId: number) {
    return this.http.get<TypeMouvementCaisse[]>(`${environment.apiUrl}/villages/${villageId}/types-depenses`);
  }

  create(villageId: number, dto: UpdateTypeMouvementCaisseRequest) {
    return this.http.post<TypeMouvementCaisse>(`${environment.apiUrl}/villages/${villageId}/types-depenses`, dto);
  }

  update(villageId: number, typeId: number, dto: UpdateTypeMouvementCaisseRequest) {
    return this.http.put<TypeMouvementCaisse>(
      `${environment.apiUrl}/villages/${villageId}/types-depenses/${typeId}`,
      dto,
    );
  }

  delete(villageId: number, typeId: number) {
    return this.http.delete<void>(`${environment.apiUrl}/villages/${villageId}/types-depenses/${typeId}`);
  }
}
