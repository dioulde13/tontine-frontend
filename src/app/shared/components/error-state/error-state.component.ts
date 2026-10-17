import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Icon } from '../icon/icon.component';

@Component({
  selector: 'app-error-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.css',
})
export class ErrorState {
  readonly title = input<string>('Impossible de charger les données');
  readonly description = input<string>(
    'Une erreur est survenue lors de la communication avec le serveur.',
  );
  readonly retry = output<void>();
}
