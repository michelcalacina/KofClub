import { Component } from '@angular/core';
import { NavController, IonicPage, LoadingController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service'
import firebase from 'firebase';
import { ClubModel } from '../../model/club-model';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {
  
  clubs: Array<ClubModel>;
  private hasLoadedUser = false;
  
  constructor(public navCtrl: NavController, private firebaseService: FirebaseService
  , private loadingCtrl: LoadingController) {
    
    this.clubs = new Array<ClubModel>();
    
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        navCtrl.setRoot('Login'); 
      } else {
        this.loadClubsList();
      }
    });
  }

  logout() {
    this.firebaseService.logout();
  }

  ionViewWillLoad() {
    if (firebase.auth().currentUser !== null) {
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

  openClub(club: ClubModel) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

}
