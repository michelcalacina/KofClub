import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubRequestAccess } from './club-request-access';

@NgModule({
  declarations: [
    ClubRequestAccess,
  ],
  imports: [
    IonicPageModule.forChild(ClubRequestAccess),
  ],
  exports: [
    ClubRequestAccess
  ]
})
export class ClubRequestAccessModule {}
