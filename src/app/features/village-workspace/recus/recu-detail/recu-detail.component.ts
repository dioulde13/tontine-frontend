import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth';
import { NUMERO_MOIS_LABEL, Paiement, Recu, recuMontantTotal, recuPeriodes, utilisateurNomComplet } from '../../../../core/models';
import { RecuService } from '../../../../core/services/recu';
import { ErrorState } from '../../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../../shared/components/icon/icon.component';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton.component';
import { formatDate, formatMontant } from '../../../../shared/utils/format';
import { montantEnLettres } from '../../../../shared/utils/nombre-en-lettres';

@Component({
  selector: 'app-recu-detail',
  imports: [RouterLink, Icon, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recu-detail.component.html',
  styleUrl: './recu-detail.component.css',
})
export class RecuDetail {
  private readonly recuService = inject(RecuService);
  private readonly auth = inject(AuthService);

  readonly villageId = input<string>('');
  readonly recuId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));
  readonly recuIdNumber = computed(() => Number(this.recuId()));

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly recu = signal<Recu | null>(null);

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
    this.recuIdNumber();
    this.load();
  });

  nomComplet(r: Recu): string {
    return utilisateurNomComplet(r.paiements[0].utilisateur);
  }

  village(r: Recu): string {
    return r.paiements[0].utilisateur.village?.nom ?? '—';
  }

  periodes(r: Recu): string {
    return recuPeriodes(r);
  }

  periodeUnique(p: Paiement): string {
    return `${NUMERO_MOIS_LABEL[p.mois]} ${p.annee}`;
  }

  montantTotal(r: Recu): number {
    return recuMontantTotal(r);
  }

  montant(value: number): string {
    return formatMontant(value);
  }

  montantLettres(value: number): string {
    return montantEnLettres(value);
  }

  date(iso: string): string {
    return formatDate(iso);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const recu = await firstValueFrom(this.recuService.findOne(this.villageIdNumber(), this.recuIdNumber()));
      this.recu.set(recu);
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
