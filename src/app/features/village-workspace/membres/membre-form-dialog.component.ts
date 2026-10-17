import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Utilisateur } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { Modal } from '../../../shared/components/modal/modal.component';
import { TELEPHONE_PATTERN } from '../../../shared/utils/validators';

@Component({
  selector: 'app-membre-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membre-form-dialog.component.html',
})
export class MembreFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly membre = input<Utilisateur | null>(null);
  readonly saved = output<Utilisateur>();
  readonly closed = output<void>();

  readonly saving = signal(false);

  readonly form = this.fb.group({
    nom: this.fb.control('', [Validators.required]),
    prenom: this.fb.control('', [Validators.required]),
    telephone: this.fb.control('', [Validators.required, Validators.pattern(TELEPHONE_PATTERN)]),
    // Optionnel, utilisé seulement en modification : laisser vide conserve le mot de passe actuel.
    motDePasse: this.fb.control('', [Validators.minLength(6)]),
  });

  ngOnInit(): void {
    const membre = this.membre();
    if (membre) {
      this.form.patchValue({ nom: membre.nom, prenom: membre.prenom, telephone: membre.telephone });
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
      const current = this.membre();
      const result = current
        ? await firstValueFrom(
            this.utilisateurService.update(current.id, {
              nom: values.nom,
              prenom: values.prenom,
              telephone: values.telephone,
              motDePasse: values.motDePasse.trim() === '' ? null : values.motDePasse,
              roleIds: current.roles.map((r) => r.id),
              villageId: current.village?.id ?? this.villageId(),
              villagesGeresIds: current.villagesGeres.map((v) => v.id),
            }),
          )
        : await firstValueFrom(
            this.utilisateurService.creerMembre(this.villageId(), {
              nom: values.nom,
              prenom: values.prenom,
              telephone: values.telephone,
            }),
          );
      this.notifications.success(current ? 'Membre modifié avec succès.' : 'Membre ajouté avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
