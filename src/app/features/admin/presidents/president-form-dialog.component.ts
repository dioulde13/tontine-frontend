import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ROLE_PRESIDENT, Utilisateur, Village } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { RoleService } from '../../../core/services/role';
import { UtilisateurService } from '../../../core/services/utilisateur';
import { VillageService } from '../../../core/services/village';
import { Modal } from '../../../shared/components/modal/modal.component';
import { TELEPHONE_PATTERN } from '../../../shared/utils/validators';

/**
 * Le rôle PRESIDENT n'est jamais choisi par l'utilisateur du formulaire : son id est résolu
 * automatiquement depuis les rôles réellement présents en base (GET /api/roles), par nom.
 */
@Component({
  selector: 'app-president-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './president-form-dialog.component.html',
  styleUrl: './president-form-dialog.component.css',
})
export class PresidentFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly roleService = inject(RoleService);
  private readonly villageService = inject(VillageService);
  private readonly notifications = inject(NotificationService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly president = input<Utilisateur | null>(null);
  readonly saved = output<Utilisateur>();
  readonly closed = output<void>();

  readonly saving = signal(false);
  readonly villages = signal<Village[]>([]);
  readonly selectedVillagesIds = signal<Set<number>>(new Set());
  readonly roleResolu = signal(false);
  private presidentRoleId: number | null = null;

  readonly form = this.fb.group({
    nom: this.fb.control('', [Validators.required]),
    prenom: this.fb.control('', [Validators.required]),
    telephone: this.fb.control('', [Validators.required, Validators.pattern(TELEPHONE_PATTERN)]),
    // Optionnel : ignoré à la création (mot de passe initial = téléphone), et à la modification
    // laisser vide conserve le mot de passe actuel (voir UpdateUtilisateurRequest).
    motDePasse: this.fb.control('', [Validators.minLength(6)]),
  });

  async ngOnInit(): Promise<void> {
    const [roles, villages] = await Promise.all([
      firstValueFrom(this.roleService.findAll()),
      firstValueFrom(this.villageService.findAll()),
    ]);
    this.presidentRoleId = roles.find((r) => r.nom === ROLE_PRESIDENT)?.id ?? null;
    this.roleResolu.set(this.presidentRoleId !== null);
    if (this.presidentRoleId === null) {
      this.notifications.error(`Le rôle "${ROLE_PRESIDENT}" n'existe pas encore côté serveur.`);
    }
    this.villages.set(villages);

    const current = this.president();
    if (current) {
      this.form.patchValue({ nom: current.nom, prenom: current.prenom, telephone: current.telephone });
      this.selectedVillagesIds.set(new Set(current.villagesGeres.map((v) => v.id)));
    }
  }

  isSelected(id: number): boolean {
    return this.selectedVillagesIds().has(id);
  }

  toggle(id: number): void {
    const next = new Set(this.selectedVillagesIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedVillagesIds.set(next);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.presidentRoleId === null) {
      this.form.markAllAsTouched();
      this.elementRef.nativeElement.querySelector('.ng-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        roleIds: [this.presidentRoleId],
        villageId: null,
        villagesGeresIds: Array.from(this.selectedVillagesIds()),
      };
      const current = this.president();
      const result = current
        ? await firstValueFrom(this.utilisateurService.update(current.id, dto))
        : await firstValueFrom(this.utilisateurService.create(dto));
      this.notifications.success(current ? 'Président modifié avec succès.' : 'Président créé avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
