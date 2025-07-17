import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { DashboardAdminPageRoutingModule } from './dashboard-admin-routing.module';
import { DashboardAdminPage } from './dashboard-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    DashboardAdminPageRoutingModule
  ],
  declarations: [DashboardAdminPage]
})
export class DashboardAdminPageModule {}