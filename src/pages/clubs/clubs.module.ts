import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Clubs } from './clubs';

@NgModule({
  declarations: [
    Clubs,
  ],
  imports: [
    IonicPageModule.forChild(Clubs),
  ],
  exports: [
    Clubs
  ]
})
export class ClubsModule {}
