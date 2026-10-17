import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainer } from '../../shared/components/toast-container/toast-container.component';
import { Footer } from '../footer/footer.component';
import { LayoutShellBase } from '../layout-shell-base';
import { Navbar } from '../navbar/navbar.component';
import { NavSection, Sidebar } from '../sidebar/sidebar.component';

const SECTIONS: NavSection[] = [
  {
    items: [{ label: 'Tableau de bord', icon: 'dashboard', route: '/admin/dashboard' }],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Villages', icon: 'buildings', route: '/admin/villages' },
      { label: 'Présidents', icon: 'shield', route: '/admin/presidents' },
      { label: 'Membres', icon: 'users', route: '/admin/membres' },
    ],
  },
  {
    items: [{ label: 'Mon profil', icon: 'user', route: '/admin/profil' }],
  },
];

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Navbar, Footer, ToastContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayout extends LayoutShellBase {
  readonly sections = SECTIONS;
}
