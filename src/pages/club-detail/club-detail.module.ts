import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubDetail } from './club-detail';

@NgModule({
  declarations: [
    ClubDetail,
  ],
  imports: [
    IonicPageModule.forChild(ClubDetail),
  ],
  exports: [
    ClubDetail
  ]
})
export class ClubDetailModule {}
