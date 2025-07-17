import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { GestionTecnicosPageRoutingModule } from './gestion-tecnicos-routing.module';
import { GestionTecnicosPage } from './gestion-tecnicos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    GestionTecnicosPageRoutingModule
  ],
  declarations: [GestionTecnicosPage]
})
export class GestionTecnicosPageModule {}