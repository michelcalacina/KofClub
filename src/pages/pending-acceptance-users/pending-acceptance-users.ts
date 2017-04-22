import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ClubModel, CLUB_USER_STATUS } from '../../model/club-model';

import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-pending-acceptance-users',
  templateUrl: 'pending-acceptance-users.html',
})
export class PendingAcceptanceUsers {
  private club: ClubModel;
  public pendingUsers: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService) {
    this.club = this.navParams.get('club');
    let userKeys = this.navParams.get("userKeys");

    this.loadPendingUsers(userKeys);
  }

  private loadPendingUsers(userKeys: Array<string>) {
    this.firebaseService.listPendingUsersClub(this.club, userKeys);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PendingAcceptanceUsers');
  }

}
