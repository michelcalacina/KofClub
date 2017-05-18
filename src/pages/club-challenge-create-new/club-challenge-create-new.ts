import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController
  , ModalController, ToastController } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController
  , public modalCtrl: ModalController, public toastCtrl: ToastController) {
    
    this.club = navParams.get("club");
    this.challengesProfile = new Array<ChallengeProfileModel>();
    this.loadOpponents();
  }

  private loadOpponents() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.getClubOtherMembers(this.club)
    .then((users: Array<UserProfileModel>) => {
      let runningChallenges: Array<string> = this.navParams.get("runningChallenges");

      users.forEach(user => {
        let challengeProfile = new ChallengeProfileModel();
        challengeProfile.user = user;

        runningChallenges.forEach(rc => {
          if (rc.valueOf() === user.getUid().valueOf()) {
            challengeProfile.isChallenge = true;
            return false;  
          }
        });

        this.challengesProfile.push(challengeProfile);
      });

      loading.dismiss();
    }, (err) => {
      loading.dismiss();
      console.log(err);
    });
  }

  openChallengeView(challengeProfile: ChallengeProfileModel) {
    if (challengeProfile.isChallenge) {
      this.showToast("Você já possui um desafio em andamento contra " + challengeProfile.user.displayName);
      return;
    }
    
    let modalChallenge = this.modalCtrl.create('ModalChallengeClubMember'
    , {"member": challengeProfile.user, "club": this.club});
    
    modalChallenge.onDidDismiss((success: boolean = false) => {
      if (success) {
        challengeProfile.isChallenge = true;
      }
    });
    modalChallenge.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClubChallengeCreateNew');
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      dismissOnPageChange: true,
      duration: 3000,
      message: message,
    });
    toast.present();
  }

}


