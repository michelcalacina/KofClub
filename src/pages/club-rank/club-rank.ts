import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams
, LoadingController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { RankProfileModel } from '../../model/rank-profile-model';

@IonicPage()
@Component({
  selector: 'page-club-rank',
  templateUrl: 'club-rank.html',
})
export class ClubRank {

  private club: ClubModel;
  rankProfiles: Array<RankProfileModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService) {

    this.rankProfiles = new Array<RankProfileModel>();
    this.club = navParams.get("club");
    this.loadClubRank();
  }

  loadClubRank() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.firebaseService.loadClubRank(this.club)
    .then(rankProfiles => {
      this.rankProfiles = rankProfiles;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

}
