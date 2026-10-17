import { Service, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}

let nextId = 0;

@Service()
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  warning(message: string): void {
    this.push('warning', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private push(variant: ToastVariant, message: string): void {
    const id = nextId++;
    this.toasts.update((toasts) => [...toasts, { id, variant, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
