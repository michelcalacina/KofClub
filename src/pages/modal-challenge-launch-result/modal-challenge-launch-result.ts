import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,
 LoadingController, ToastController, ViewController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';
import { ChallengeModel, ChallengeStatus } from '../../model/challenge-model';

@IonicPage()
@Component({
  selector: 'page-modal-challenge-launch-result',
  templateUrl: 'modal-challenge-launch-result.html',
})
export class ModalChallengeLaunchResult {
  private club: ClubModel;
  loggedUser: UserProfileModel;
  challenge: ChallengeModel;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public firebaseService: FirebaseService) {
    this.club = navParams.get("club");
    this.loggedUser = navParams.get("loggedUser");
    this.challenge = navParams.get("challenge");

    if (this.loggedUser.getUid().valueOf() === this.challenge.challenger.valueOf()) {
      this.challenge.isResultLaunchedByChallenger = true;
    }
  }

  launchResult() {
    this.firebaseService.launchChallengeResult(this.club, this.challenge)
    .then((_) => {
      // TODO
    }, (err) => {});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalChallengeLaunchResult');
  }

}
