import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubChallengeCreateNew } from './club-challenge-create-new';

@NgModule({
  declarations: [
    ClubChallengeCreateNew,
  ],
  imports: [
    IonicPageModule.forChild(ClubChallengeCreateNew),
  ],
  exports: [
    ClubChallengeCreateNew
  ]
})
export class ClubChallengeCreateNewModule {}
