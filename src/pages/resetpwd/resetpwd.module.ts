import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Resetpwd } from './resetpwd';

@NgModule({
  declarations: [
    Resetpwd,
  ],
  imports: [
    IonicPageModule.forChild(Resetpwd),
  ],
  exports: [
    Resetpwd
  ]
})
export class ResetpwdModule {}
