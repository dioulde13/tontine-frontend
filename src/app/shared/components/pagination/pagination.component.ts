import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Icon } from '../icon/icon.component';

export type PageEntry = number | 'ellipsis';

/**
 * Pagination entièrement côté client : aucun endpoint du backend n'expose de pagination
 * (page/size), donc la page complète est chargée une fois puis découpée ici.
 */
@Component({
  selector: 'app-pagination',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  readonly rangeStart = computed(() => (this.page() - 1) * this.pageSize() + 1);
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.totalItems()));

  /** Fenêtre de numéros autour de la page courante, avec 1/dernière page toujours visibles. */
  readonly pageNumbers = computed<PageEntry[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const entries: PageEntry[] = [];
    const window = new Set<number>([1, total, current - 1, current, current + 1]);
    const sorted = [...window].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

    let previous = 0;
    for (const n of sorted) {
      if (previous && n - previous > 1) {
        entries.push('ellipsis');
      }
      entries.push(n);
      previous = n;
    }
    return entries;
  });

  trackEntry(index: number, entry: PageEntry): string {
    return entry === 'ellipsis' ? `ellipsis-${index}` : `page-${entry}`;
  }
}
