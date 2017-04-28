import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController
  , ModalController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';
import { ChallengeProfileModel } from '../../model/challenge-profile-model';


@IonicPage()
@Component({
  selector: 'page-club-challenge-create-new',
  templateUrl: 'club-challenge-create-new.html',
})
export class ClubChallengeCreateNew {

  private club: ClubModel;
  challengesProfile: Array<ChallengeProfileModel>;
  private loading: any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController
  , public modalCtrl: ModalController) {
    
    this.club = navParams.get("club");
    this.challengesProfile = new Array<ChallengeProfileModel>();
    this.loadOpponents();
  }

  private loadOpponents() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    this.firebaseService.getClubOtherMembers(this.club)
    .then((users: Array<UserProfileModel>) => {
      let otherChallenges: Array<string> = this.navParams.get("otherChallenges");
      let myChallenges: Array<string> = this.navParams.get("myChallenges");

      users.forEach(user => {
        let challengeProfile = new ChallengeProfileModel();
        challengeProfile.user = user;

        myChallenges.forEach(mc => {
          if (mc.valueOf() === user.getUid().valueOf()) {
            challengeProfile.isChallenged = true;
            return false;  
          }
        });

        otherChallenges.forEach(oc => {
          if (oc.valueOf() === user.getUid().valueOf()) {
            challengeProfile.isChallenger = true;
            return false;
          }
        });
        this.challengesProfile.push(challengeProfile);
      });

      this.loading.dismiss();
    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }

  openChallengeView(challengeProfile: ChallengeProfileModel) {
    let modalChallenge = this.modalCtrl.create('ModalChallengeClubMember'
    , {"member": challengeProfile.user, "club": this.club});
    modalChallenge.onDidDismiss((success: boolean = false) => {
      if (success) {
        challengeProfile.isChallenged = true;
      }
    });
    modalChallenge.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClubChallengeCreateNew');
  }

}


