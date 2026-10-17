import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ROLE_MEMBRE, Utilisateur, Village } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { RoleService } from '../../../core/services/role';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { VillageService } from '../../../core/services/village';
import { Modal } from '../../../shared/components/modal/modal.component';
import { TELEPHONE_PATTERN } from '../../../shared/utils/validators';

/** Le rôle MEMBRE est résolu automatiquement depuis GET /api/roles, jamais choisi dans le formulaire. */
@Component({
  selector: 'app-admin-membre-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membre-form-dialog.component.html',
})
export class AdminMembreFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly roleService = inject(RoleService);
  private readonly villageService = inject(VillageService);
  private readonly notifications = inject(NotificationService);

  readonly membre = input<Utilisateur | null>(null);
  readonly saved = output<Utilisateur>();
  readonly closed = output<void>();

  readonly saving = signal(false);
  readonly villages = signal<Village[]>([]);
  readonly roleResolu = signal(false);
  private membreRoleId: number | null = null;

  readonly form = this.fb.group({
    nom: this.fb.control('', [Validators.required]),
    prenom: this.fb.control('', [Validators.required]),
    telephone: this.fb.control('', [Validators.required, Validators.pattern(TELEPHONE_PATTERN)]),
    // Optionnel : ignoré à la création (mot de passe initial = téléphone), et à la modification
    // laisser vide conserve le mot de passe actuel (voir UpdateUtilisateurRequest).
    motDePasse: this.fb.control('', [Validators.minLength(6)]),
    villageId: this.fb.control<number | null>(null, [Validators.required]),
  });

  async ngOnInit(): Promise<void> {
    const [roles, villages] = await Promise.all([
      firstValueFrom(this.roleService.findAll()),
      firstValueFrom(this.villageService.findAll()),
    ]);
    this.membreRoleId = roles.find((r) => r.nom === ROLE_MEMBRE)?.id ?? null;
    this.roleResolu.set(this.membreRoleId !== null);
    if (this.membreRoleId === null) {
      this.notifications.error(`Le rôle "${ROLE_MEMBRE}" n'existe pas encore côté serveur.`);
    }
    this.villages.set(villages);

    const current = this.membre();
    if (current) {
      this.form.patchValue({
        nom: current.nom,
        prenom: current.prenom,
        telephone: current.telephone,
        villageId: current.village?.id ?? null,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.membreRoleId === null) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const values = this.form.getRawValue();
      const dto = {
        nom: values.nom,
        prenom: values.prenom,
        telephone: values.telephone,
        motDePasse: values.motDePasse.trim() === '' ? null : values.motDePasse,
        roleIds: [this.membreRoleId],
        villageId: values.villageId,
        villagesGeresIds: [],
      };
      const current = this.membre();
      const result = current
        ? await firstValueFrom(this.utilisateurService.update(current.id, dto))
        : await firstValueFrom(this.utilisateurService.create(dto));
      this.notifications.success(current ? 'Membre modifié avec succès.' : 'Membre créé avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
