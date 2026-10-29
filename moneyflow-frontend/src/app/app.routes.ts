import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Movimentacoes } from './pages/movimentacoes/movimentacoes';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard
  },
  {
    path: 'movimentacoes',
    component: Movimentacoes
  },
  {
    path: '**',
    redirectTo: ''
  }
];
