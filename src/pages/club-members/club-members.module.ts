import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubMembers } from './club-members';

@NgModule({
  declarations: [
    ClubMembers,
  ],
  imports: [
    IonicPageModule.forChild(ClubMembers),
  ],
  exports: [
    ClubMembers
  ]
})
export class ClubMembersModule {}
