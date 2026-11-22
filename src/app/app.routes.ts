import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'explorar' },
  {
    path: 'explorar',
    title: 'Explorar · Partida',
    loadComponent: () => import('./features/explore/explore').then((m) => m.Explore),
  },
  {
    path: 'juego/:id',
    title: 'Juego · Partida',
    loadComponent: () => import('./features/game-detail/game-detail').then((m) => m.GameDetailPage),
  },
  {
    path: 'biblioteca',
    title: 'Biblioteca · Partida',
    loadComponent: () => import('./features/library/library').then((m) => m.Library),
  },
  {
    path: 'avisos',
    title: 'Avisos · Partida',
    loadComponent: () => import('./features/alerts/alerts').then((m) => m.Alerts),
  },
  { path: '**', redirectTo: 'explorar' },
];
