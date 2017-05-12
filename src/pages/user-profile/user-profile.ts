import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,
AlertController, LoadingController, ToastController } from 'ionic-angular';

import { UserProfileModel } from '../../model/user-profile-model';
import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfile {

  profile: UserProfileModel;
  isEditMode: boolean;

  private avatares = ["profile-akuma.png", "profile-alba.png", "profile-chun-li.png",
    "profile-clark.png","profile-elena-sf4.png","profile-goro-daimon.png",
    "profile-hugo.png","profile-ken-master.png","profile-kusanagi.png","profile-leona.png",
    "profile-lin-xiang-feing.png","profile-makoto.png","profile-ralf-jhones.png","profile-rolento.png",
    "profile-sie-kensou.png"];
  private currentAvatarIndex: number;
  
  private newAvatarUrl: string;
  private newName: string;
  private newEmail: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private firebaseService: FirebaseService, private alertCtrl: AlertController,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController ) {
    
    this.profile = new UserProfileModel();
    this.isEditMode = false;

    this.loadUserProfile();
    this.currentAvatarIndex = -1;
  }

  loadUserProfile() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.getUserProfile().then(user => {
      this.profile = user;
      this.newAvatarUrl = this.profile.thumbnailUrl;
      this.newName = this.profile.displayName;
      this.newEmail = this.profile.email;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  changePassword() {
      let alert = this.alertCtrl.create({
      title: 'Trocar senha',
      inputs: [
        {
          name: 'current_password',
          placeholder: 'Senha atual',
          type: 'password'
        },
        {
          name: 'new_password',
          placeholder: 'Nova senha',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Trocar',
          handler: data => {
            if (data.new_password !== undefined && data.new_password.trim().length >= 6) {
              let loading = this.loadingCtrl.create({dismissOnPageChange: true});
              loading.present();
              this.firebaseService.changePassword(this.profile.email
              , data.current_password, data.new_password)
              .then(() => {
                loading.dismiss();
                this.showToast("Senha alterada com sucesso!");
              }, (err) => {
                console.log(err);
                loading.dismiss();
                this.showToast("Falha, senha não foi alterada!");
              });
            } else {
              this.showToast("Senha deve ter ao menos 6 dígitos."); 
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      dismissOnPageChange: true
    }).present();
  }

  changeAvatar($event) {
    // From center to left
    if ($event.direction === 2) {
      if (this.currentAvatarIndex < this.avatares.length - 1) {
        this.currentAvatarIndex++;
      } else {
        this.currentAvatarIndex = 0;
      }
    } else if ($event.direction === 4) { // From center to right
      if (this.currentAvatarIndex > 0) {
        this.currentAvatarIndex--;
      } else {
        this.currentAvatarIndex = this.avatares.length - 1;
      }
    }

    this.newAvatarUrl = "assets/img/"+this.avatares[this.currentAvatarIndex];
  }

  saveChanges() {
    if (this.newName.trim().length === 0) {
      this.showToast("Nome inválido!");
      return;
    }

    let regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!regexp.test(this.newEmail)) {
      this.showToast("E-mail inválido");
      return;
    }

    // TODO
  }

}
