import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainer } from '../../shared/components/toast-container/toast-container.component';
import { Footer } from '../footer/footer.component';
import { Navbar } from '../navbar/navbar.component';

/**
 * Pas de sidebar globale ici (demande explicite) : le président n'a qu'une seule destination
 * de haut niveau (Mes villages), et "Mon profil" reste accessible via le menu utilisateur de la
 * navbar. Une fois dans un village, VillageWorkspace fournit sa propre sidebar (les onglets).
 */
@Component({
  selector: 'app-president-layout',
  imports: [RouterOutlet, Navbar, Footer, ToastContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './president-layout.component.html',
  styleUrl: './president-layout.component.css',
})
export class PresidentLayout {}
