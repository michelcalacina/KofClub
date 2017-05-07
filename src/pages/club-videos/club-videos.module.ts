import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubVideos } from './club-videos';

@NgModule({
  declarations: [
    ClubVideos,
  ],
  imports: [
    IonicPageModule.forChild(ClubVideos),
  ],
  exports: [
    ClubVideos
  ]
})
export class ClubVideosModule {}
