import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionTecnicosPage } from './gestion-tecnicos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionTecnicosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionTecnicosPageRoutingModule {}