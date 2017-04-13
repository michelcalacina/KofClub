import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserClubs } from './user-clubs';

@NgModule({
  declarations: [
    UserClubs,
  ],
  imports: [
    IonicPageModule.forChild(UserClubs),
  ],
  exports: [
    UserClubs
  ]
})
export class UserClubsModule {}
