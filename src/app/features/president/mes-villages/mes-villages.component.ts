import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Village } from '../../../core/models';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-mes-villages',
  imports: [RouterLink, Icon, EmptyState, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mes-villages.component.html',
  styleUrl: './mes-villages.component.css',
})
export class MesVillages implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);

  readonly villages = signal<Village[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const villages = await firstValueFrom(this.utilisateurService.mesVillagesGeres());
      this.villages.set(villages);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
