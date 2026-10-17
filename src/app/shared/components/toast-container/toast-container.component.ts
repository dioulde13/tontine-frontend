import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationService, ToastVariant } from '../../../core/services/notification';
import { Icon, IconName } from '../icon/icon.component';

const ICON_BY_VARIANT: Record<ToastVariant, IconName> = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'alert-circle',
};

@Component({
  selector: 'app-toast-container',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainer {
  readonly notifications = inject(NotificationService);

  iconFor(variant: ToastVariant): IconName {
    return ICON_BY_VARIANT[variant];
  }
}
