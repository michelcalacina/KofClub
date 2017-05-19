import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams
  , LoadingController, ToastController, ViewController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';
import { ChallengeModel, ChallengeStatus } from '../../model/challenge-model';

@IonicPage()
@Component({
  selector: 'page-modal-challenge-club-member',
  templateUrl: 'modal-challenge-club-member.html',
})
export class ModalChallengeClubMember {
  private club: ClubModel;
  private challenge: ChallengeModel;
  private dateModel: Date;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService
  , public toastCtrl: ToastController, public viewCtrl: ViewController) {

    let opponent: UserProfileModel = navParams.get("member");
    this.club = navParams.get("club");

    this.challenge = new ChallengeModel();
    let currentDate = new Date();
    this.challenge.date = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString();
    // Get the current logged user, as challenger.
    this.firebaseService.getUserProfile().then( (loggedUser) => {
      this.challenge.userChallenger = loggedUser;
    });
    this.challenge.userChallenged = opponent;
    this.challenge.status = ChallengeStatus.PENDING;
}

  confirmChallenge() {
    if (this.challenge.local === undefined 
    || this.challenge.local.trim().length === 0) {
      this.showToast("Informe o local!", false);
      return;
    }

    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.createChallenge(this.club, this.challenge)
    .then((_) => {
          loading.dismiss().then(() => {
          this.showToast("Desafio lançado, aguardando confirmação do adversário!", true);
      });
    }, (err) => {
      loading.dismiss();
      console.log(err);
    });
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  private showToast(message: string, showButton: boolean) {
    let toast = this.toastCtrl.create({
        message: message,
        showCloseButton: showButton,
        closeButtonText: "OK",
        dismissOnPageChange: true,
      });

      if (!showButton) {
        toast.setDuration(3000);
      }

      toast.onDidDismiss(() => {
        if (showButton) {
          this.viewCtrl.dismiss(true);
        }
      });
      toast.present();
  }
}
