import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, ROLE_ADMIN, ROLE_PRESIDENT, Utilisateur } from '../models';
import { decodeJwtPayload, isJwtExpired } from './jwt.util';
import { tokenStorage } from './token-storage';

/**
 * L'API ne fournit aucune route "/me" renvoyant le profil complet (rôles, village géré...).
 * On décode le téléphone depuis le JWT (seule information disponible dans le token), puis on le
 * retrouve dans GET /api/utilisateurs — le seul endpoint qui expose rôles + villages.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<Utilisateur | null>(null);
  /** true une fois la tentative de restauration de session (au démarrage) terminée. */
  readonly initialized = signal(false);

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly roles = computed(() => this.currentUser()?.roles.map((r) => r.nom) ?? []);

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: readonly string[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  estPresidentDuVillage(villageId: number): boolean {
    return this.currentUser()?.villagesGeres.some((v) => v.id === villageId) ?? false;
  }

  /**
   * Espace d'atterrissage après connexion. Un même utilisateur peut cumuler plusieurs rôles
   * (ex: ADMIN + PRESIDENT) : ADMIN prime (vision globale), puis PRESIDENT, puis MEMBRE par défaut.
   */
  readonly espacePrincipal = computed<'admin' | 'president' | 'membre'>(() => {
    if (this.hasRole(ROLE_ADMIN)) {
      return 'admin';
    }
    if (this.hasRole(ROLE_PRESIDENT)) {
      return 'president';
    }
    return 'membre';
  });

  readonly urlAtterrissage = computed(() => {
    switch (this.espacePrincipal()) {
      case 'admin':
        return '/admin/dashboard';
      case 'president':
        return '/president/villages';
      default:
        return '/membre';
    }
  });

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => tokenStorage.set(res.token)),
      map(() => void 0),
    );
  }

  async chargerProfilApresLogin(): Promise<void> {
    await this.chargerProfil();
  }

  logout(): void {
    tokenStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Appelé une seule fois au démarrage de l'application (voir provideAppInitializer dans app.config.ts). */
  async restoreSession(): Promise<void> {
    const token = tokenStorage.get();
    if (!token || isJwtExpired(token)) {
      tokenStorage.clear();
      this.initialized.set(true);
      return;
    }
    await this.chargerProfil();
    this.initialized.set(true);
  }

  private async chargerProfil(): Promise<void> {
    const token = tokenStorage.get();
    const payload = token ? decodeJwtPayload(token) : null;
    if (!payload) {
      tokenStorage.clear();
      this.currentUser.set(null);
      return;
    }

    const utilisateurs = await firstValueFrom(
      this.http.get<Utilisateur[]>(`${environment.apiUrl}/utilisateurs`).pipe(
        catchError(() => of<Utilisateur[]>([])),
      ),
    );
    const profil = utilisateurs.find((u) => u.telephone === payload.sub) ?? null;

    if (!profil) {
      tokenStorage.clear();
      this.currentUser.set(null);
      return;
    }
    this.currentUser.set(profil);
  }
}
