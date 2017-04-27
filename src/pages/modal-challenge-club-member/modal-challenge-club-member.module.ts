import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalChallengeClubMember } from './modal-challenge-club-member';

@NgModule({
  declarations: [
    ModalChallengeClubMember,
  ],
  imports: [
    IonicPageModule.forChild(ModalChallengeClubMember),
  ],
  exports: [
    ModalChallengeClubMember
  ]
})
export class ModalChallengeClubMemberModule {}
