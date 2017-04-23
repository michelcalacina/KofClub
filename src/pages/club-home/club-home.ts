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
    this.isLoggedOnAdmin = this.verifyIsLoggedOnAdmin();

    // Only for test please remove.
    if (this.club == undefined) {
      this.mockClubks();
    }

    this.pendingUserKeys = new Array<string>();
  }

  verifyIsLoggedOnAdmin(): boolean {
    let result: boolean = false;
    let user = this.firebaseService.getUserProfile();
    if (this.club.admins.indexOf(user.getUid()) > -1) {
      result = true;
    }

    return result;
  }

  ionViewWillEnter() {
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

}
