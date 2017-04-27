import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController
  , ModalController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';


@IonicPage()
@Component({
  selector: 'page-club-challenge-create-new',
  templateUrl: 'club-challenge-create-new.html',
})
export class ClubChallengeCreateNew {

  private club: ClubModel;
  members: Array<UserProfileModel>;
  private loading: any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController
  , public modalCtrl: ModalController) {
    
    this.club = navParams.get("club");
    this.loadClubMembers();
  }

  private loadClubMembers() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    this.firebaseService.getClubMembers(this.club)
    .then((members: Array<UserProfileModel>) => {
      this.members = members;
      this.loading.dismiss();
    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }

  openChallengeView(member: UserProfileModel) {
    let modalChallenge = this.modalCtrl.create('ModalChallengeClubMember'
    , {"member": member, "club": this.club});
    modalChallenge.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClubChallengeCreateNew');
  }

}


