import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Village } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification';
import { VillageService } from '../../../core/services/village';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyState } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorState } from '../../../shared/components/error-state/error-state.component';
import { Icon } from '../../../shared/components/icon/icon.component';
import { Pagination } from '../../../shared/components/pagination/pagination.component';
import { Skeleton } from '../../../shared/components/skeleton/skeleton.component';
import { VillageFormDialog } from './village-form-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-villages',
  imports: [Icon, Skeleton, EmptyState, ErrorState, Pagination, VillageFormDialog, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './villages.component.html',
})
export class Villages implements OnInit {
  private readonly villageService = inject(VillageService);
  private readonly notifications = inject(NotificationService);

  readonly PAGE_SIZE = PAGE_SIZE;

  readonly villages = signal<Village[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly search = signal('');
  readonly page = signal(1);

  readonly dialogVillage = signal<Village | 'new' | null>(null);
  readonly aSupprimer = signal<Village | null>(null);
  readonly deleting = signal(false);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const all = this.villages();
    return term ? all.filter((v) => v.nom.toLowerCase().includes(term)) : all;
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const villages = await firstValueFrom(this.villageService.findAll());
      this.villages.set(villages);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(event: Event | null): void {
    const value = event ? (event.target as HTMLInputElement).value : '';
    this.search.set(value);
    this.page.set(1);
  }

  onSaved(): void {
    this.dialogVillage.set(null);
    this.load();
  }

  async confirmerSuppression(village: Village): Promise<void> {
    this.deleting.set(true);
    try {
      await firstValueFrom(this.villageService.delete(village.id));
      this.notifications.success('Village supprimé avec succès.');
      this.aSupprimer.set(null);
      this.load();
    } finally {
      this.deleting.set(false);
    }
  }
}
