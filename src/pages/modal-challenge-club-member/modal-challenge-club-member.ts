import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams
  , LoadingController, ToastController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';

@IonicPage()
@Component({
  selector: 'page-modal-challenge-club-member',
  templateUrl: 'modal-challenge-club-member.html',
})
export class ModalChallengeClubMember {
  private opponent: UserProfileModel;
  private club: ClubModel;
  private loading: any;
  challengeLocal: string;
  challengeDate: any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService
  , public toatCtrl: ToastController) {

    this.opponent = navParams.get("member");
    this.club = navParams.get("club");
    this.challengeDate = new Date().toISOString();
  
}

  confirmChallenge() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      showBackdrop: false
    });

    this.firebaseService.createChallenge(this.club
      , this.opponent, this.challengeLocal, this.challengeDate).then( (_) => {
      this.loading.dismiss();
      let toast = this.toatCtrl.create({
        message: "Desafio lançado, aguardando confirmação do adversário!",
        showCloseButton: true,
        closeButtonText: "OK",
        dismissOnPageChange: true,
      });

      toast.onDidDismiss(() => {
        this.navCtrl.pop();
      });

    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }

}
