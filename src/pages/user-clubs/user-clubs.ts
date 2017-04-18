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
  clubs: Array<any> = new Array;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController) {
    
    this.mockAddFakeClubs();
  }

  // Only for teste purpose.
  private mockAddFakeClubs() {
    let club1 = new ClubModel();
    club1.title = "Kolonia fighters";
    club1.description = "Clube de jogadores da colônia antônio aleixo";
    club1.thumbnailURL = "assets/img/club-colonia.png";
    
    let club2 = new ClubModel();
    club1.title = "Kolonia fighters";
    club1.description = "Clube de jogadores da colônia antônio aleixo";
    club1.thumbnailURL = "assets/img/club-colonia.png";
    
    this.clubs.push(club1);
    this.clubs.push(club2);
  }

  loadClubsList() {
    this.firebaseService.listCurrentUserClubs()
      .then( clubList => {
        this.clubs = clubList;
        this.loading.dismiss();
      })
    
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();
  }

  createClub() {
    this.navCtrl.push('ClubCreateNew');
  }

  openClub(club) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

}
