import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalChallengeLaunchResult } from './modal-challenge-launch-result';

@NgModule({
  declarations: [
    ModalChallengeLaunchResult,
  ],
  imports: [
    IonicPageModule.forChild(ModalChallengeLaunchResult),
  ],
  exports: [
    ModalChallengeLaunchResult
  ]
})
export class ModalChallengeLaunchResultModule {}
