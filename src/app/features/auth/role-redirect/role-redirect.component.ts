import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth';

/**
 * Landing de la route "/" : redirige immédiatement vers l'espace du rôle principal
 * de l'utilisateur connecté (ADMIN > PRESIDENT > MEMBRE, voir AuthService.urlAtterrissage).
 */
@Component({
  selector: 'app-role-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-redirect.component.html',
})
export class RoleRedirect implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.navigateByUrl(this.auth.urlAtterrissage());
  }
}
