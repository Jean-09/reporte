import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearReportePage } from './crear-reporte.page';

const routes: Routes = [
  {
    path: '',
    component: CrearReportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearReportePageRoutingModule {}