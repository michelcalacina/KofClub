import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubHome } from './club-home';

@NgModule({
  declarations: [
    ClubHome,
  ],
  imports: [
    IonicPageModule.forChild(ClubHome),
  ],
  exports: [
    ClubHome
  ]
})
export class ClubHomeModule {}
