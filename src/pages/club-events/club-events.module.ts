import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClubEvents } from './club-events';

@NgModule({
  declarations: [
    ClubEvents,
  ],
  imports: [
    IonicPageModule.forChild(ClubEvents),
  ],
  exports: [
    ClubEvents
  ]
})
export class ClubEventsModule {}
