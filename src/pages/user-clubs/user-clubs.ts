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

  clubs: Array<ClubModel>;
  private hasEnterCreateClub: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController) {
    
    this.clubs = new Array<ClubModel>();
    this.hasEnterCreateClub = false;
  }

  ionViewDidEnter() {
    if (this.clubs.length === 0 || this.hasEnterCreateClub) {
      this.hasEnterCreateClub = false;
      this.loadClubsList();  
    }
  }

  loadClubsList() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.listCurrentUserClubs()
      .then( clubList => {
        this.clubs = clubList;
        loading.dismiss();
      }, (err) => {
        console.log(err);
        loading.dismiss();
      });
  }

  createClub() {
    this.hasEnterCreateClub = true;
    this.navCtrl.push('ClubCreateNew');
  }

  openClub(club: ClubModel) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

}
