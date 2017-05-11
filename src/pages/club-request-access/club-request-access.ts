import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-club-request-access',
  templateUrl: 'club-request-access.html',
})
export class ClubRequestAccess {

  clubKey: string;

  constructor(private navCtrl: NavController, private navParams: NavParams
  , private loadingCtrl: LoadingController, private firebaseService: FirebaseService
  , private toastCtrl: ToastController ) {
  }

  back() {
    this.navCtrl.pop();
  }

  requestAccess() {
    if (this.clubKey === undefined || this.clubKey.trim().length === 0) {
      this.presentToast("Informe a chave do clube");
      return;
    }

    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.requestAccessToClub(this.clubKey)
    .then(status => {
      loading.dismiss();
      // Success
      if (status === 1) {
        this.presentToast("Feito, aguardando validação.", true);
      } else if (status === 2) {
        this.presentToast("Desculpe, o clube está cheio!");
      } else if (status === 3) {
        this.presentToast("Desculpe, esse clube não existe!");
      } else if (status === 4) {
        this.presentToast("Você já faz parte desse clube!");
      } else if (status === 5) {
        this.presentToast("Já existe uma solicitação em avaliação!");
      }
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  private presentToast(message: string, isShowButton: boolean = false) {
    let toast = this.toastCtrl.create({
      message: message,
      closeButtonText: "OK",
      dismissOnPageChange: true,
      position: "bottom"
    });
    if (isShowButton) {
      toast.setShowCloseButton(true);
      toast.onDidDismiss(() => {
        this.navCtrl.pop();
      });
    } else {
      toast.setDuration(4000);
    }

    toast.present();
  }
}
