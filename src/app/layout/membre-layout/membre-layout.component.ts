import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainer } from '../../shared/components/toast-container/toast-container.component';
import { Footer } from '../footer/footer.component';
import { LayoutShellBase } from '../layout-shell-base';
import { Navbar } from '../navbar/navbar.component';
import { NavSection, Sidebar } from '../sidebar/sidebar.component';

const SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Tableau de bord', icon: 'dashboard', route: '/membre/dashboard' },
      { label: 'Mes cotisations', icon: 'wallet', route: '/membre/cotisations' },
      { label: 'Mon profil', icon: 'user', route: '/membre/profil' },
    ],
  },
];

@Component({
  selector: 'app-membre-layout',
  imports: [RouterOutlet, Sidebar, Navbar, Footer, ToastContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membre-layout.component.html',
  styleUrl: './membre-layout.component.css',
})
export class MembreLayout extends LayoutShellBase {
  readonly sections = SECTIONS;
}
