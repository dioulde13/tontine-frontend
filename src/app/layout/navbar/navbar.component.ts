import { toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth';
import { utilisateurNomComplet } from '../../core/models';
import { ClickOutside } from '../../shared/directives/click-outside';
import { Icon } from '../../shared/components/icon/icon.component';

function deepestTitle(snapshot: ActivatedRouteSnapshot): string {
  let current = snapshot;
  let title = (current.data['title'] as string) ?? '';
  while (current.firstChild) {
    current = current.firstChild;
    title = (current.data['title'] as string) ?? title;
  }
  return title;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Icon, ClickOutside],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly profilLink = input<string>('/membre/profil');
  readonly showSidebarToggle = input<boolean>(true);
  readonly toggleSidebar = output<void>();
  readonly menuOpen = signal(false);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => deepestTitle(this.router.routerState.snapshot.root)),
      startWith(deepestTitle(this.router.routerState.snapshot.root)),
    ),
    { initialValue: '' },
  );

  readonly pageTitle = computed(() => this.navigationEnd() || 'Cotisation');

  readonly userName = computed(() => {
    const user = this.auth.currentUser();
    return user ? utilisateurNomComplet(user) : '';
  });

  readonly userRoleLabel = computed(() => {
    const roles = this.auth.roles();
    return roles.length > 0 ? roles.join(' · ') : 'Utilisateur';
  });

  readonly initials = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return '?';
    }
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  });

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
