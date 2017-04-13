import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubChalenge } from './club-chalenge';

@NgModule({
  declarations: [
    ClubChalenge,
  ],
  imports: [
    IonicPageModule.forChild(ClubChalenge),
  ],
  exports: [
    ClubChalenge
  ]
})
export class ClubChalengeModule {}
