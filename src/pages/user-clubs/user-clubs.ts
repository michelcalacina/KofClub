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
  private hasLoadedNewClubs = false;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController) {
    
    this.loadClubsList();
  }

  loadClubsList() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    this.firebaseService.listCurrentUserClubs()
      .then( clubList => {
        this.clubs = clubList;
        this.loading.dismiss();
      }, (err) => {
        this.loading.dismiss();
      });
  }

  createClub() {
    this.hasLoadedNewClubs = true;
    this.navCtrl.push('ClubCreateNew');
  }

  openClub(club: ClubModel) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

  ionViewDidEnter() {
    if (this.hasLoadedNewClubs) {
      this.loadClubsList();
      this.hasLoadedNewClubs = false;
    }
  }

}
