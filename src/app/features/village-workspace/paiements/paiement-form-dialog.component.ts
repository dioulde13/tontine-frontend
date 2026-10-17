import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { MOIS, MOIS_LABEL, Mois, Paiement, Utilisateur, utilisateurNomComplet } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { PaiementService } from '../../../core/services/paiement';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { AutocompleteSelect } from '../../../shared/components/autocomplete-select/autocomplete-select.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Modal } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-paiement-form-dialog',
  imports: [ReactiveFormsModule, Modal, Icon, AutocompleteSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paiement-form-dialog.component.html',
  styleUrl: './paiement-form-dialog.component.css',
})
export class PaiementFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly paiementService = inject(PaiementService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly saved = output<Paiement[]>();
  readonly closed = output<void>();

  readonly tousLesMois = MOIS;
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly membres = signal<Utilisateur[]>([]);
  readonly membreOptions = computed(() =>
    this.membres().map((m) => ({ value: m.id, label: this.nomComplet(m) })),
  );
  readonly paiementsExistants = signal<Paiement[]>([]);
  readonly moisSelectionnes = signal<Set<Mois>>(new Set());
  /** Coché par défaut : conserve le comportement historique (pénalité appliquée aux mois en retard). */
  readonly appliquerPenaliteRetard = signal(true);

  readonly form = this.fb.group({
    utilisateurId: this.fb.control<number | null>(null, [Validators.required]),
    annee: this.fb.control(new Date().getFullYear(), [Validators.required]),
  });

  private readonly utilisateurIdSignal = toSignal(this.form.controls.utilisateurId.valueChanges, {
    initialValue: this.form.controls.utilisateurId.value,
  });
  private readonly anneeSignal = toSignal(this.form.controls.annee.valueChanges, {
    initialValue: this.form.controls.annee.value,
  });

  /** Numéros (1-12) des mois déjà payés par le membre sélectionné, pour l'année sélectionnée. */
  readonly moisDejaPayes = computed<Set<number>>(() => {
    const membreId = this.utilisateurIdSignal();
    const annee = this.anneeSignal();
    if (membreId === null) {
      return new Set();
    }
    return new Set(
      this.paiementsExistants()
        .filter((p) => p.utilisateur.id === membreId && p.annee === annee)
        .map((p) => p.mois),
    );
  });

  // Évite de soumettre une sélection qui ne correspond plus au membre/année affiché après un changement.
  private readonly resetSelectionOnChange = effect(() => {
    this.utilisateurIdSignal();
    this.anneeSignal();
    this.moisSelectionnes.set(new Set());
    this.appliquerPenaliteRetard.set(true);
  });

  /** true si au moins un mois sélectionné est déjà passé : seul cas où une pénalité de retard peut s'appliquer. */
  readonly auMoinsUnMoisEnRetard = computed(() => {
    const annee = this.anneeSignal();
    const aujourdHui = new Date();
    const anneeCourante = aujourdHui.getFullYear();
    const moisCourant = aujourdHui.getMonth() + 1; // getMonth() est 0-indexé
    return Array.from(this.moisSelectionnes()).some((mois) => {
      const numero = MOIS.indexOf(mois) + 1;
      return annee < anneeCourante || (annee === anneeCourante && numero < moisCourant);
    });
  });

  ngOnInit(): void {
    firstValueFrom(this.utilisateurService.findMembresDuVillage(this.villageId())).then((membres) =>
      this.membres.set(membres),
    );
    firstValueFrom(this.paiementService.findByVillage(this.villageId())).then((paiements) =>
      this.paiementsExistants.set(paiements),
    );
  }

  estDejaPaye(mois: Mois): boolean {
    return this.moisDejaPayes().has(MOIS.indexOf(mois) + 1);
  }

  nomComplet(u: Utilisateur): string {
    return utilisateurNomComplet(u);
  }

  moisLabel(mois: Mois): string {
    return MOIS_LABEL[mois];
  }

  toggleMois(mois: Mois): void {
    const next = new Set(this.moisSelectionnes());
    next.has(mois) ? next.delete(mois) : next.add(mois);
    this.moisSelectionnes.set(next);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.moisSelectionnes().size === 0) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const values = this.form.getRawValue();
      const result = await firstValueFrom(
        this.paiementService.create(this.villageId(), {
          utilisateurId: values.utilisateurId!,
          annee: values.annee,
          mois: Array.from(this.moisSelectionnes()),
          appliquerPenaliteRetard: this.appliquerPenaliteRetard(),
        }),
      );
      this.notifications.success(
        result.length > 1 ? `${result.length} paiements enregistrés avec succès.` : 'Paiement enregistré avec succès.',
      );
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
