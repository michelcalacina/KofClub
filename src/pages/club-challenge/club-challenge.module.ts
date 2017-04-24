import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubChallenge } from './club-challenge';

@NgModule({
  declarations: [
    ClubChallenge,
  ],
  imports: [
    IonicPageModule.forChild(ClubChallenge),
  ],
  exports: [
    ClubChallenge
  ]
})
export class ClubChallengeModule {}
