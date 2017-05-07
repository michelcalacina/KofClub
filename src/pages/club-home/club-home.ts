import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';

@IonicPage()
@Component({
  selector: 'page-club-home',
  templateUrl: 'club-home.html',
})
export class ClubHome {

  public club: ClubModel;
  public isLoggedOnAdmin: boolean = false;
  
  // For users admin control pending users request to enter on club.
  public pendingUserKeys: Array<string>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService) {
    
    this.club = navParams.get("club");
    this.verifyIsLoggedOnAdmin();
    this.pendingUserKeys = new Array<string>();
  }

  verifyIsLoggedOnAdmin() {
    this.firebaseService.getUserProfile().then((user) => {
      if (this.club.admins.indexOf(user.getUid().valueOf()) > -1) {
        this.isLoggedOnAdmin = true;
      }
    });
  }

  ionViewDidEnter() {
    if (this.isLoggedOnAdmin) {
      this.firebaseService.getPendingRequestToEnterClub(this.club)
      .then((pendingUserKeys) => {
        this.pendingUserKeys = pendingUserKeys;
      });
    }
  }

  showPendingUsers() {
    this.navCtrl.push("PendingAcceptanceUsers", {"club": this.club, "userKeys": this.pendingUserKeys});
  }

  openChallenge() {
    this.navCtrl.push("ClubChallenge", {"club": this.club, "isAdmin": this.isLoggedOnAdmin});
  }

  openEventChallenge() {
    this.navCtrl.push("ClubEvents", {"club": this.club});
  }

  openRank() {
    this.navCtrl.push("ClubRank", {"club": this.club});
  }

  openVideos() {
    this.navCtrl.push("ClubVideos", {"club": this.club});
  }

}
