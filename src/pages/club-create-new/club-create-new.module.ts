import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubCreateNew } from './club-create-new';

@NgModule({
  declarations: [
    ClubCreateNew,
  ],
  imports: [
    IonicPageModule.forChild(ClubCreateNew),
  ],
  exports: [
    ClubCreateNew
  ]
})
export class ClubCreateNewModule {}
