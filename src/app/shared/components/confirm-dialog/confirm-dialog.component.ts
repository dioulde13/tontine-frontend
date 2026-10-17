import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Modal } from '../modal/modal.component';

/**
 * Dialogue de confirmation réutilisable (section 17 : toute suppression doit être confirmée).
 * Utilisation : un signal `aSupprimer = signal<T | null>(null)` dans la page, affiché avec
 * `@if (aSupprimer())`. Pas de service global : chaque page garde le contrôle de son état.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialog {
  readonly title = input<string>('Confirmer');
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Confirmer');
  readonly danger = input<boolean>(true);
  readonly loading = input<boolean>(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
