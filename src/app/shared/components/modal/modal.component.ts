import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  input,
  output,
} from '@angular/core';

import { Icon } from '../icon/icon.component';

/**
 * Coquille de modale/drawer générique (section 16). À utiliser dans un @if côté appelant,
 * pour que l'écouteur Escape et le verrouillage du scroll ne vivent que pendant l'ouverture.
 */
@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class Modal implements OnInit, OnDestroy {
  readonly title = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly closed = output<void>();

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }
}
