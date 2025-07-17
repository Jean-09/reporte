import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CrearReportePageRoutingModule } from './crear-reporte-routing.module';
import { CrearReportePage } from './crear-reporte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearReportePageRoutingModule
  ],
  declarations: [CrearReportePage]
})
export class CrearReportePageModule {}