import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubRank } from './club-rank';

@NgModule({
  declarations: [
    ClubRank,
  ],
  imports: [
    IonicPageModule.forChild(ClubRank),
  ],
  exports: [
    ClubRank
  ]
})
export class ClubRankModule {}
