import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingAcceptanceUsers } from './pending-acceptance-users';

@NgModule({
  declarations: [
    PendingAcceptanceUsers,
  ],
  imports: [
    IonicPageModule.forChild(PendingAcceptanceUsers),
  ],
  exports: [
    PendingAcceptanceUsers
  ]
})
export class PendingAcceptanceUsersModule {}
