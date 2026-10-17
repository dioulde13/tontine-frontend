import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Village } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { VillageService } from '../../../core/services/village';
import { Modal } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-village-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './village-form-dialog.component.html',
})
export class VillageFormDialog implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly villageService = inject(VillageService);
  private readonly notifications = inject(NotificationService);

  readonly village = input<Village | null>(null);
  readonly saved = output<Village>();
  readonly closed = output<void>();

  readonly saving = signal(false);

  readonly form = this.fb.group({
    nom: this.fb.control('', [Validators.required]),
  });

  ngOnInit(): void {
    const village = this.village();
    if (village) {
      this.form.patchValue({ nom: village.nom });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const dto = { nom: this.form.getRawValue().nom };
      const current = this.village();
      const result = current
        ? await firstValueFrom(this.villageService.update(current.id, dto))
        : await firstValueFrom(this.villageService.create(dto));
      this.notifications.success(current ? 'Village modifié avec succès.' : 'Village créé avec succès.');
      this.saved.emit(result);
    } finally {
      this.saving.set(false);
    }
  }
}
