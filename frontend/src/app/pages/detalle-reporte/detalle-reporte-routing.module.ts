import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleReportePage } from './detalle-reporte.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleReportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleReportePageRoutingModule {}