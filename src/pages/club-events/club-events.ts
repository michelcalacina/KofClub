import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams
, LoadingController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { ChallengeModel } from '../../model/challenge-model';

@IonicPage()
@Component({
  selector: 'page-club-events',
  templateUrl: 'club-events.html',
})
export class ClubEvents {

  private club: ClubModel;
  public challengeEvents: Array<ChallengeModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService) {
    
    this.club = navParams.get("club");
    this.challengeEvents = new Array<ChallengeModel>();

    this.loadEvents();
  }

  loadEvents() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.loadClubEvents(this.club)
    .then((resultData) => {
      if (resultData.length > 0) {
        this.challengeEvents = resultData[0];
      }
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

}
