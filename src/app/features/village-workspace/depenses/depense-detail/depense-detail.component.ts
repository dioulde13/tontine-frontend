import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth';
import { Depense, utilisateurNomComplet } from '../../../../core/models';
import { DepenseService } from '../../../../core/services/depense';
import { ErrorState } from '../../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../../shared/components/icon/icon.component';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton.component';
import { formatDate, formatDateTime, formatMontant } from '../../../../shared/utils/format';
import { montantEnLettres } from '../../../../shared/utils/nombre-en-lettres';

@Component({
  selector: 'app-depense-detail',
  imports: [RouterLink, Icon, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depense-detail.component.html',
  styleUrl: './depense-detail.component.css',
})
export class DepenseDetail {
  private readonly depenseService = inject(DepenseService);
  private readonly auth = inject(AuthService);

  readonly villageId = input<string>('');
  readonly depenseId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));
  readonly depenseIdNumber = computed(() => Number(this.depenseId()));

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly depense = signal<Depense | null>(null);

  // DepenseResponseDTO ne porte pas le village (voir DepenseMapper) : résolu ici depuis les villages
  // gérés par l'utilisateur connecté, comme VillageWorkspace.village.
  readonly nomVillage = computed(
    () => this.auth.currentUser()?.villagesGeres.find((v) => v.id === this.villageIdNumber())?.nom ?? '—',
  );

  /** N'affiche le nom du président signataire que si l'utilisateur connecté gère réellement ce village. */
  readonly nomPresident = computed(() => {
    const user = this.auth.currentUser();
    if (!user || !this.auth.estPresidentDuVillage(this.villageIdNumber())) {
      return null;
    }
    return utilisateurNomComplet(user);
  });

  private readonly loadOnParamsChange = effect(() => {
    this.villageIdNumber();
    this.depenseIdNumber();
    this.load();
  });

  montant(value: number): string {
    return formatMontant(value);
  }

  montantLettres(value: number): string {
    return montantEnLettres(value);
  }

  date(iso: string): string {
    return formatDate(iso);
  }

  dateTime(iso: string): string {
    return formatDateTime(iso);
  }

  /** Préfère le nom résolu (creeParNom) ; retombe sur le téléphone brut (creePar) si inconnu. */
  genereParLabel(d: Depense): string {
    const qui = d.creeParNom ?? d.creePar;
    return qui ? ` par ${qui}` : '';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const depense = await firstValueFrom(
        this.depenseService.findOne(this.villageIdNumber(), this.depenseIdNumber()),
      );
      this.depense.set(depense);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  imprimer(): void {
    window.print();
  }
}
