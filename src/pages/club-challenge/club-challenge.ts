import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';

@IonicPage()
@Component({
  selector: 'page-club-challenge',
  templateUrl: 'club-challenge.html',
})
export class ClubChallenge {
  private club: ClubModel;
  isAdminLogged: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService) {
    this.club = navParams.get("club");
    this.isAdminLogged = navParams.get("isAdmin");

    // Only for test please remove.
    if (this.club == undefined) {
      this.mockClubks();
      this.isAdminLogged = true;
    }
    //---------------remove later ---------------
  }

  openChallengeCreateView() {
    this.navCtrl.push('ClubChallengeCreateNew', {"club": this.club});
  }

  ionViewDidLoad() {

  }

  // Only for teste, delete this after conclusion
  mockClubks() {
    let j = {"creationDate":1492652673040
              ,"description":"ndjdkdkdkx"
              ,"thumbnailURL":"https://firebasestorage.googleapis.com/v0/b/kof-club.appspot.com/o/images%2Flogos%2FKoccFighters.png?alt=media&token=7b69926a-1caa-43bc-81f7-1c69a4090bbd"
              ,"title":"KoccFighters"
              ,"admins":{"KUlqGiIDjKYzW6f3abZWtTZc4S03": true}
            };

    let club1 = ClubModel.toClubModel(j);
    this.club = club1;
  }
  // ------------------------------REMOVE LATER-----------------
}
