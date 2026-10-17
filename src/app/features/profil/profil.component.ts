import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth';
import { UtilisateurService } from '../../core/services/utilisateur';
import { NotificationService } from '../../core/services/notification';
import { TELEPHONE_PATTERN } from '../../shared/utils/validators';

@Component({
  selector: 'app-profil',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
})
export class Profil {
  private readonly auth = inject(AuthService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly user = this.auth.currentUser;
  readonly saving = signal(false);

  readonly villagesGeresLabel = computed(
    () => this.user()?.villagesGeres.map((v) => v.nom).join(', ') ?? '',
  );

  readonly form = this.fb.group({
    nom: this.fb.control('', [Validators.required]),
    prenom: this.fb.control('', [Validators.required]),
    telephone: this.fb.control('', [Validators.required, Validators.pattern(TELEPHONE_PATTERN)]),
    // Optionnel : laisser vide pour conserver le mot de passe actuel (voir UpdateUtilisateurRequest).
    motDePasse: this.fb.control('', [Validators.minLength(6)]),
  });

  constructor() {
    const u = this.user();
    if (u) {
      this.form.patchValue({ nom: u.nom, prenom: u.prenom, telephone: u.telephone });
    }
  }

  async onSubmit(): Promise<void> {
    const u = this.user();
    if (!u || this.form.invalid) {
      return;
    }
    this.saving.set(true);
    try {
      const values = this.form.getRawValue();
      await firstValueFrom(
        this.utilisateurService.update(u.id, {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          motDePasse: values.motDePasse.trim() === '' ? null : values.motDePasse,
          roleIds: u.roles.map((r) => r.id),
          villageId: u.village?.id ?? null,
          villagesGeresIds: u.villagesGeres.map((v) => v.id),
        }),
      );
      this.notifications.success('Profil mis à jour avec succès.');
      this.form.patchValue({ motDePasse: '' });
      await this.auth.restoreSession();
    } finally {
      this.saving.set(false);
    }
  }
}
