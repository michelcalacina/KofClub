import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,
 LoadingController, ToastController, ViewController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';
import { ChallengeModel, ChallengeStatus } from '../../model/challenge-model';

@IonicPage()
@Component({
  selector: 'page-modal-challenge-launch-result',
  templateUrl: 'modal-challenge-launch-result.html',
})
export class ModalChallengeLaunchResult {
  private club: ClubModel;
  loggedUser: UserProfileModel;
  challenge: ChallengeModel;
  private isLoggedAdim: boolean;
  challengerWins: number = 0;
  challengedWins: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public firebaseService: FirebaseService, public loadingCtrl: LoadingController,
  public viewCtrl: ViewController, public toastCtrl: ToastController) {
    this.club = navParams.get("club");
    this.loggedUser = navParams.get("loggedUser");
    this.challenge = navParams.get("challenge");
    this.isLoggedAdim = navParams.get("isLoggedAdmin");

    if (this.loggedUser.getUid().valueOf() 
        === this.challenge.userChallenger.getUid().valueOf()) {
      this.challenge.isResultByChallenger = true;
    }
  }

  launchResult() {

    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.launchChallengeResult(this.club, this.challenge, this.isLoggedAdim)
    .then((_) => {
      loading.dismiss().then(() => {
        this.showToast("Aguardando confirmação do oponente", true);
      });
    }, (err) => {
      loading.dismiss();
      this.showToast("Falha de comunicação com o serviço de dados!", false);
    });
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalChallengeLaunchResult');
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
        this.viewCtrl.dismiss({success: true, challengeUpdated: this.challenge});
      });

      toast.present();
  }

}
