import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { roleGuard } from './core/auth/role-guard';
import { ROLE_ADMIN, ROLE_PRESIDENT } from './core/models';

/** Sous-arbre des onglets d'un village (Dashboard/Membres/.../Reçus), partagé entre /admin et /president. */
const villageWorkspaceChildren: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/village-workspace/dashboard/village-dashboard.component').then((m) => m.VillageDashboard),
    data: { title: 'Dashboard du village' },
  },
  {
    path: 'membres',
    loadComponent: () => import('./features/village-workspace/membres/membres.component').then((m) => m.Membres),
    data: { title: 'Membres' },
  },
  {
    path: 'configuration',
    loadComponent: () =>
      import('./features/village-workspace/configuration/configuration.component').then((m) => m.Configuration),
    data: { title: 'Configuration' },
  },
  {
    path: 'reunions',
    loadComponent: () =>
      import('./features/village-workspace/reunions/reunion-list/reunion-list.component').then((m) => m.ReunionList),
    data: { title: 'Réunions' },
  },
  {
    path: 'reunions/:reunionId/presences',
    loadComponent: () =>
      import('./features/village-workspace/reunions/reunion-presences/reunion-presences.component').then(
        (m) => m.ReunionPresences,
      ),
    data: { title: 'Présences' },
  },
  {
    path: 'paiements',
    loadComponent: () => import('./features/village-workspace/paiements/paiements.component').then((m) => m.Paiements),
    data: { title: 'Paiements' },
  },
  {
    path: 'penalites',
    loadComponent: () => import('./features/village-workspace/penalites/penalites.component').then((m) => m.Penalites),
    data: { title: 'Pénalités' },
  },
  {
    path: 'recus',
    loadComponent: () =>
      import('./features/village-workspace/recus/recu-list/recu-list.component').then((m) => m.RecuList),
    data: { title: 'Reçus' },
  },
  {
    path: 'recus/:recuId',
    loadComponent: () =>
      import('./features/village-workspace/recus/recu-detail/recu-detail.component').then((m) => m.RecuDetail),
    data: { title: 'Reçu' },
  },
];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.Login),
    data: { title: 'Connexion' },
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/role-redirect/role-redirect.component').then((m) => m.RoleRedirect),
  },

  // ---------------------------------------------------------------- ADMIN --
  // Layout autonome du workspace village : déclaré AVANT 'admin' à dessein — le '**' interne
  // de 'admin' ci-dessous matcherait sinon 'villages/:id' en premier et l'avalerait.
  {
    path: 'admin/villages/:villageId',
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_ADMIN])],
    loadComponent: () =>
      import('./features/village-workspace/village-workspace.component').then((m) => m.VillageWorkspace),
    data: { backLink: '/admin/villages', backLabel: 'Villages', profilLink: '/admin/profil' },
    children: villageWorkspaceChildren,
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_ADMIN])],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboard),
        data: { title: 'Tableau de bord' },
      },
      {
        path: 'villages',
        loadComponent: () => import('./features/admin/villages/villages.component').then((m) => m.Villages),
        data: { title: 'Villages' },
      },
      {
        path: 'presidents',
        loadComponent: () => import('./features/admin/presidents/presidents.component').then((m) => m.Presidents),
        data: { title: 'Présidents' },
      },
      {
        path: 'membres',
        loadComponent: () => import('./features/admin/membres/membres.component').then((m) => m.AdminMembres),
        data: { title: 'Membres' },
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/profil/profil.component').then((m) => m.Profil),
        data: { title: 'Mon profil' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  // ----------------------------------------------------------- PRESIDENT --
  // Même raison : déclaré AVANT 'president' pour ne pas être avalé par son '**' interne.
  {
    path: 'president/villages/:villageId',
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_PRESIDENT])],
    loadComponent: () =>
      import('./features/village-workspace/village-workspace.component').then((m) => m.VillageWorkspace),
    data: { backLink: '/president/villages', backLabel: 'Mes villages', profilLink: '/president/profil' },
    children: villageWorkspaceChildren,
  },
  {
    path: 'president',
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_PRESIDENT])],
    loadComponent: () => import('./layout/president-layout/president-layout.component').then((m) => m.PresidentLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'villages' },
      {
        path: 'villages',
        loadComponent: () =>
          import('./features/president/mes-villages/mes-villages.component').then((m) => m.MesVillages),
        data: { title: 'Mes villages' },
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/profil/profil.component').then((m) => m.Profil),
        data: { title: 'Mon profil' },
      },
      { path: '**', redirectTo: 'villages' },
    ],
  },

  // --------------------------------------------------------------- MEMBRE --
  // Pas de canMatch par rôle ici : c'est l'espace par défaut (le moins privilégié) pour tout
  // utilisateur authentifié qui n'est ni ADMIN ni PRESIDENT (voir AuthService.espacePrincipal).
  {
    path: 'membre',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/membre-layout/membre-layout.component').then((m) => m.MembreLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/membre/dashboard/membre-dashboard.component').then((m) => m.MembreDashboard),
        data: { title: 'Tableau de bord' },
      },
      {
        path: 'cotisations',
        loadComponent: () =>
          import('./features/membre/cotisations/membre-cotisations.component').then((m) => m.MembreCotisations),
        data: { title: 'Mes cotisations' },
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/profil/profil.component').then((m) => m.Profil),
        data: { title: 'Mon profil' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
