import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';

import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-pending-acceptance-users',
  templateUrl: 'pending-acceptance-users.html',
})

export class PendingAcceptanceUsers {
  private club: ClubModel;
  public pendingUsers: Array<UserProfileModel>;
  public users: Array<UserProfileModel>;
  private attemptActionUsers: Array<UserProfileModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController
  , public toastCtrl: ToastController) {

    this.club = this.navParams.get('club');
    let userKeys = this.navParams.get("userKeys");

    this.loadPendingUsers(userKeys);
    this.attemptActionUsers = new Array<UserProfileModel>();
  }

  private loadPendingUsers(userKeys: Array<string>) {
    this.firebaseService.listPendingUsersClub(this.club, userKeys).then( users => {
      this.users = users;
    });
  }

  onCheckedChange(status, user: UserProfileModel) {
    if (status) {
      this.attemptActionUsers.push(user);
    } else {
      let i = this.attemptActionUsers.indexOf(user);
      if (i > -1) {
        this.attemptActionUsers.splice(i, 1);
      } 
    }
  }

  acceptSelectedUsers() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.firebaseService.acceptPendingUsersToClub(this.attemptActionUsers, this.club)
    .then((res) => {
      if (this.attemptActionUsers.length === this.users.length) {
        this.navCtrl.pop();
      } else {
        this.attemptActionUsers.forEach(u => {
          let index = this.users.indexOf(u);
          if (index > -1) {
            this.users.splice(index, 1);   
          }
        });
        this.attemptActionUsers = new Array<UserProfileModel>();
        this.showToastMessage("Feito!");
      }
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
      this.showToastMessage("Falha ao adicionar");
    });
  }

  refuseSelectedUsers() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.firebaseService.rejectPendingUsersToClub(this.attemptActionUsers, this.club)
      .then((res) => {
        loading.dismiss();
        if (this.attemptActionUsers.length === this.users.length) {
          this.navCtrl.pop();
        } else {
          this.attemptActionUsers.forEach(u => {
            let index = this.users.indexOf(u);
            if (index > -1) {
              this.users.splice(index, 1);   
            }
          });
          this.attemptActionUsers = new Array<UserProfileModel>();
          this.showToastMessage("Removido!");
       }
      }, (err) => {
        console.log(err);
        loading.dismiss();
        this.showToastMessage("Falha ao excluir solicitação!");
    });
  }

  showToastMessage(message: string) {
    this.toastCtrl.create({
        message: message,
        duration: 3000,
        position: "bottom" 
      }).present();
  }

}
