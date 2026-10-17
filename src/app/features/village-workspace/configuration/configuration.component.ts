import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ConfigurationVillage } from '../../../core/models';
import { ConfigurationVillageService } from '../../../core/services/configuration-village';
import { NotificationService } from '../../../core/services/notification';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-configuration',
  imports: [ReactiveFormsModule, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class Configuration {
  private readonly configService = inject(ConfigurationVillageService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly villageId = input<string>('');
  readonly villageIdNumber = computed(() => Number(this.villageId()));

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly saving = signal(false);
  /** null tant qu'aucune configuration n'existe encore pour ce village (création plutôt que modification). */
  readonly config = signal<ConfigurationVillage | null>(null);

  readonly form = this.fb.group({
    montantCotisationMensuelle: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    montantPenaliteRetard: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    montantPenaliteAbsenceReunion: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  private readonly loadOnVillageChange = effect(() => {
    this.villageIdNumber();
    this.load();
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.config.set(null);
    this.form.reset();
    try {
      const config = await firstValueFrom(this.configService.findByVillage(this.villageIdNumber()));
      this.config.set(config);
      this.form.patchValue({
        montantCotisationMensuelle: config.montantCotisationMensuelle,
        montantPenaliteRetard: config.montantPenaliteRetard,
        montantPenaliteAbsenceReunion: config.montantPenaliteAbsenceReunion,
      });
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        this.config.set(null);
      } else {
        this.error.set(true);
      }
    } finally {
      this.loading.set(false);
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
      const dto = {
        montantCotisationMensuelle: values.montantCotisationMensuelle!,
        montantPenaliteRetard: values.montantPenaliteRetard!,
        montantPenaliteAbsenceReunion: values.montantPenaliteAbsenceReunion!,
      };
      const current = this.config();
      const config = current
        ? await firstValueFrom(this.configService.update(this.villageIdNumber(), dto))
        : await firstValueFrom(this.configService.create(this.villageIdNumber(), dto));
      this.notifications.success(current ? 'Configuration mise à jour avec succès.' : 'Configuration créée avec succès.');
      this.config.set(config);
    } finally {
      this.saving.set(false);
    }
  }
}
