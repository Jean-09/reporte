import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DetalleReportePageRoutingModule } from './detalle-reporte-routing.module';
import { DetalleReportePage } from './detalle-reporte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleReportePageRoutingModule
  ],
  declarations: [DetalleReportePage]
})
export class DetalleReportePageModule {}