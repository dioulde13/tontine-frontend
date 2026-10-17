import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Lignes de squelette animées pour les états de chargement (tableaux, listes, cartes). */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class Skeleton {
  readonly rows = input<number>(5);
  readonly cols = input<number>(4);

  rowsArray(): number[] {
    return Array.from({ length: this.rows() }, (_, i) => i);
  }
  colsArray(): number[] {
    return Array.from({ length: this.cols() }, (_, i) => i);
  }
}
