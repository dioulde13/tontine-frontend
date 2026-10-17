import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CreateMembreRequest, UpdateUtilisateurRequest, Utilisateur, Village } from '../models';

const BASE_URL = `${environment.apiUrl}/utilisateurs`;

/** Reflète UtilisateurController + VillageMembreController. */
@Service()
export class UtilisateurService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<Utilisateur[]>(BASE_URL);
  }

  findById(id: number) {
    return this.http.get<Utilisateur>(`${BASE_URL}/${id}`);
  }

  /** GET /api/utilisateurs/moi/villages : villages gérés par le président actuellement connecté. */
  mesVillagesGeres() {
    return this.http.get<Village[]>(`${BASE_URL}/moi/villages`);
  }

  create(dto: UpdateUtilisateurRequest) {
    return this.http.post<Utilisateur>(BASE_URL, dto);
  }

  update(id: number, dto: UpdateUtilisateurRequest) {
    return this.http.put<Utilisateur>(`${BASE_URL}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }

  /** POST /api/villages/{villageId}/membres : créé par le président du village. */
  creerMembre(villageId: number, dto: CreateMembreRequest) {
    return this.http.post<Utilisateur>(`${environment.apiUrl}/villages/${villageId}/membres`, dto);
  }

  /** GET /api/villages/{villageId}/membres */
  findMembresDuVillage(villageId: number) {
    return this.http.get<Utilisateur[]>(`${environment.apiUrl}/villages/${villageId}/membres`);
  }
}
