import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard-admin',
    loadChildren: () => import('./pages/dashboard-admin/dashboard-admin.module').then(m => m.DashboardAdminPageModule),
    data: { roles: ['administrador'] }
  },
  {
    path: 'reportes',
    loadChildren: () => import('./pages/lista-reportes/lista-reportes.module').then(m => m.ListaReportesPageModule),
  },
  {
    path: 'crear-reporte',
    loadChildren: () => import('./pages/crear-reporte/crear-reporte.module').then(m => m.CrearReportePageModule),
  },
  {
    path: 'detalle-reporte',
    loadChildren: () => import('./pages/detalle-reporte/detalle-reporte.module').then(m => m.DetalleReportePageModule),
  },
  {
    path: 'gestion-tecnicos',
    loadChildren: () => import('./pages/gestion-tecnicos/gestion-tecnicos.module').then(m => m.GestionTecnicosPageModule),
    data: { roles: ['tecnico', 'administrador'] }
  },
  {
    path: 'gestion-usuarios',
    loadChildren: () => import('./pages/gestion-usuarios/gestion-usuarios.module').then(m => m.GestionUsuariosPageModule),
    data: { roles: ['administrador'] }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
