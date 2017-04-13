import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserProfile } from './user-profile';

@NgModule({
  declarations: [
    UserProfile,
  ],
  imports: [
    IonicPageModule.forChild(UserProfile),
  ],
  exports: [
    UserProfile
  ]
})
export class UserProfileModule {}
