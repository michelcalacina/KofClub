import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';

@IonicPage()
@Component({
  selector: 'page-club-members',
  templateUrl: 'club-members.html',
})
export class ClubMembers {

  private club: ClubModel;
  private isAdmin: boolean;
  private users: Array<UserProfileModel>;
  private attemptActionUsers: Array<UserProfileModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , private firebaseService: FirebaseService, private loadingCtrl: LoadingController) {
    this.club = navParams.get("club");
    this.isAdmin = navParams.get("isAdmin");

    this.attemptActionUsers = new Array<UserProfileModel>();
    this.users = new Array<UserProfileModel>();
    this.loadMembers();
  }

  loadMembers() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.getClubOtherMembers(this.club)
    .then((users: Array<UserProfileModel>) => {
      this.club.admins.forEach(a => {
        users.forEach(user => {
          if (a.valueOf() === user.getUid().valueOf()) {
            user.isAdmin = true;
            return false;  
          }
        });
      });

      this.users = users;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  onCheckedChange(status, user: UserProfileModel) {
    
  }

  checkUser(user: UserProfileModel) {
    if (!this.isAdmin) {
      return;
    }
    user.isChecked = !user.isChecked;

    if (user.isChecked) {
      this.attemptActionUsers.push(user);
    } else {
      let i = this.attemptActionUsers.indexOf(user);
      if (i > -1) {
        this.attemptActionUsers.splice(i, 1);
      } 
    }
  }

  giveAdminPower() {

  }

  excludeMembers() {

  }

}
