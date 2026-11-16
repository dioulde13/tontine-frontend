import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Depense, TypeMouvementCaisse } from '../../../core/models';
import { DepenseService } from '../../../core/services/depense';
import { NotificationService } from '../../../core/services/notification';
import { TypeMouvementCaisseService } from '../../../core/services/type-mouvement-caisse';
import { Modal } from '../../../shared/components/modal/modal.component';
import { MontantInput } from '../../../shared/directives/montant-input';

/**
 * Pas de type pré-rempli (ni "Mariage", ni "Baptême"...) : le backend refuse toute dépense dont le
 * typeId ne correspond pas à un TypeMouvementCaisse déjà configuré pour ce village (404). Si la liste
 * est vide, on guide le président vers la gestion des types plutôt que d'afficher un formulaire bloqué.
 */
@Component({
  selector: 'app-depense-form-dialog',
  imports: [ReactiveFormsModule, Modal, MontantInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depense-form-dialog.component.html',
})
export class DepenseFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly depenseService = inject(DepenseService);
  private readonly typeService = inject(TypeMouvementCaisseService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly saved = output<Depense>();
  readonly closed = output<void>();
  readonly gererTypes = output<void>();

  readonly saving = signal(false);
  readonly loadingTypes = signal(true);
  readonly types = signal<TypeMouvementCaisse[]>([]);
  readonly aucunType = computed(() => !this.loadingTypes() && this.types().length === 0);

  readonly form = this.fb.group({
    typeId: this.fb.control<number | null>(null, [Validators.required]),
    montant: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    motif: this.fb.control(''),
    date: this.fb.control(new Date().toISOString().slice(0, 10), [Validators.required]),
    nomComptable: this.fb.control('', [Validators.required]),
  });

  async ngOnInit(): Promise<void> {
    try {
      const types = await firstValueFrom(this.typeService.findByVillage(this.villageId()));
      this.types.set(types);
    } finally {
      this.loadingTypes.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const values = this.form.getRawValue();
      const motif = values.motif.trim();
      const result = await firstValueFrom(
        this.depenseService.create(this.villageId(), {
          typeId: values.typeId!,
          montant: values.montant!,
          motif: motif ? motif : null,
          date: values.date,
          nomComptable: values.nomComptable.trim(),
        }),
      );
      this.notifications.success('Dépense enregistrée, reçu généré avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
