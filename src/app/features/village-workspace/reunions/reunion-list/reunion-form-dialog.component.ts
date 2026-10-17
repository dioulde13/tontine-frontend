import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Reunion } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification';
import { ReunionService } from '../../../../core/services/reunion';
import { Modal } from '../../../../shared/components/modal/modal.component';

/** Le backend n'expose que création + suppression pour les réunions (pas de route de modification). */
@Component({
  selector: 'app-reunion-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reunion-form-dialog.component.html',
})
export class ReunionFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reunionService = inject(ReunionService);
  private readonly notifications = inject(NotificationService);

  readonly villageId = input.required<number>();
  readonly saved = output<Reunion>();
  readonly closed = output<void>();

  readonly saving = signal(false);

  readonly form = this.fb.group({
    dateHeure: this.fb.control('', [Validators.required]),
    lieu: this.fb.control('', [Validators.required]),
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const values = this.form.getRawValue();
      const result = await firstValueFrom(
        this.reunionService.create(this.villageId(), { dateHeure: values.dateHeure, lieu: values.lieu }),
      );
      this.notifications.success('Réunion créée avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
