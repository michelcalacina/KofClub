import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { ClubModel } from '../../model/club-model';

import { FirebaseService } from '../../providers/firebase-service';

/**
 * List entire clubs
 */
@IonicPage()
@Component({
  selector: 'page-clubs',
  templateUrl: 'clubs.html',
})
export class Clubs {

  loading: any;
  clubs: Array<ClubModel> = new Array;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService) {

    this.loadClubs();
  }

  loadClubs() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    this.firebaseService.listAllClubs()
    .then( clubs => {
      this.clubs = clubs;
      this.loading.dismiss();
    }, err => {
      this.loading.dismiss();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Clubs');
  }

}
