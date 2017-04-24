import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';

import { ClubModel } from '../../model/club-model';

@IonicPage()
@Component({
  selector: 'page-user-clubs',
  templateUrl: 'user-clubs.html',
})
export class UserClubs {

  loading: any;
  clubs: Array<ClubModel> = new Array;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController) {
    
    this.loadClubsList();
  }

  loadClubsList() {
    this.firebaseService.listCurrentUserClubs()
      .then( clubList => {
        this.clubs = clubList;
        this.loading.dismiss();
      }, (err) => {
        this.loading.dismiss();
      });

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
  }

  createClub() {
    this.navCtrl.push('ClubCreateNew');
  }

  openClub(club: ClubModel) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

}
