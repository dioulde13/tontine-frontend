import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { TypeMouvementCaisse } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { TypeMouvementCaisseService } from '../../../core/services/type-mouvement-caisse';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Modal } from '../../../shared/components/modal/modal.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';

/**
 * Gestion des catégories de dépense (ex: "Mariage", "Baptême", "Décès") propres à CE village.
 * Rien n'est pré-rempli côté backend : cette liste part vide, le président l'alimente lui-même ici.
 */
@Component({
  selector: 'app-types-depenses-dialog',
  imports: [Icon, Modal, Skeleton, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './types-depenses-dialog.component.html',
  styleUrl: './types-depenses-dialog.component.css',
})
export class TypesDepensesDialog implements OnInit {
  private readonly typeService = inject(TypeMouvementCaisseService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly closed = output<void>();
  /** Émis après tout ajout/modification/suppression, pour que la page appelante rafraîchisse si besoin. */
  readonly changed = output<void>();

  readonly loading = signal(true);
  readonly types = signal<TypeMouvementCaisse[]>([]);

  readonly nouveauLibelle = signal('');
  readonly ajoutEnCours = signal(false);

  readonly editingId = signal<number | null>(null);
  readonly editValue = signal('');
  readonly editEnCours = signal(false);

  readonly aSupprimer = signal<TypeMouvementCaisse | null>(null);
  readonly suppressionEnCours = signal(false);

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const types = await firstValueFrom(this.typeService.findByVillage(this.villageId()));
      this.types.set(types);
    } finally {
      this.loading.set(false);
    }
  }

  onNouveauLibelle(event: Event): void {
    this.nouveauLibelle.set((event.target as HTMLInputElement).value);
  }

  async ajouter(): Promise<void> {
    const libelle = this.nouveauLibelle().trim();
    if (!libelle) {
      return;
    }
    this.ajoutEnCours.set(true);
    try {
      const type = await firstValueFrom(this.typeService.create(this.villageId(), { libelle }));
      this.types.update((types) => [...types, type].sort((a, b) => a.libelle.localeCompare(b.libelle)));
      this.nouveauLibelle.set('');
      this.notifications.success('Type de dépense ajouté avec succès.');
      this.changed.emit();
    } finally {
      this.ajoutEnCours.set(false);
    }
  }

  commencerEdition(type: TypeMouvementCaisse): void {
    this.editingId.set(type.id);
    this.editValue.set(type.libelle);
  }

  annulerEdition(): void {
    this.editingId.set(null);
  }

  onEditValue(event: Event): void {
    this.editValue.set((event.target as HTMLInputElement).value);
  }

  async validerEdition(type: TypeMouvementCaisse): Promise<void> {
    const libelle = this.editValue().trim();
    if (!libelle) {
      return;
    }
    this.editEnCours.set(true);
    try {
      const updated = await firstValueFrom(this.typeService.update(this.villageId(), type.id, { libelle }));
      this.types.update((types) =>
        types.map((t) => (t.id === type.id ? updated : t)).sort((a, b) => a.libelle.localeCompare(b.libelle)),
      );
      this.editingId.set(null);
      this.notifications.success('Type de dépense modifié avec succès.');
      this.changed.emit();
    } finally {
      this.editEnCours.set(false);
    }
  }

  async confirmerSuppression(type: TypeMouvementCaisse): Promise<void> {
    this.suppressionEnCours.set(true);
    try {
      await firstValueFrom(this.typeService.delete(this.villageId(), type.id));
      this.types.update((types) => types.filter((t) => t.id !== type.id));
      this.aSupprimer.set(null);
      this.notifications.success('Type de dépense supprimé avec succès.');
      this.changed.emit();
    } finally {
      this.suppressionEnCours.set(false);
    }
  }
}
