import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ListaReportesPageRoutingModule } from './lista-reportes-routing.module';
import { ListaReportesPage } from './lista-reportes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ListaReportesPageRoutingModule
  ],
  declarations: [ListaReportesPage]
})
export class ListaReportesPageModule {}