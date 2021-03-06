import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';

@IonicPage()
@Component({
  selector: 'page-club-home',
  templateUrl: 'club-home.html',
})
export class ClubHome {

  public club: ClubModel;
  public isLoggedOnAdmin: boolean = false;
  private loggedUser: UserProfileModel; 
  
  // For users admin control pending users request to enter on club.
  public pendingUserKeys: Array<string>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService) {
    
    this.club = navParams.get("club");
    this.getLoggedUser();
    this.pendingUserKeys = new Array<string>();
  }

  getLoggedUser() {
    this.firebaseService.getUserProfile().then((user) => {
      this.loggedUser = user;
      if (this.club.admins.indexOf(user.getUid().valueOf()) > -1) {
        this.loggedUser.isAdmin = true;
        // Refactory, remove this. and foward
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
    this.navCtrl.push("ClubChallenge", {"club": this.club, "isAdmin": this.isLoggedOnAdmin, "loggedUser": this.loggedUser});
  }

  openEventChallenge() {
    this.navCtrl.push("ClubEvents", {"club": this.club});
  }

  openRank() {
    this.navCtrl.push("ClubRank", {"club": this.club});
  }

  openVideos() {
    this.navCtrl.push("ClubVideos", {"club": this.club, "isAdmin": this.isLoggedOnAdmin});
  }

  openDetail() {
    this.navCtrl.push("ClubDetail", {"club": this.club, "isAdmin": this.isLoggedOnAdmin});
  }

  openMembers() {
    this.navCtrl.push("ClubMembers", {"club": this.club, "loggedUser": this.loggedUser});
  }

}
