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
  private currentPassword: string;

  private avatares = ["profile-abel.png","profile-akuma.png","profile-alba.png","profile-amaterasu.png",
    "profile-athena.png","profile-chun-li.png","profile-clark.png","profile-cris.png","profile-daimon.png",
    "profile-dante.png","profile-deadpool.png","profile-elena.png","profile-ermac.png","profile-gambit.png",
    "profile-gogeta.png","profile-hades.png","profile-hugo.png","profile-ikki.png","profile-jill.png","profile-ken.png",
    "profile-kurama.png","profile-kusanagi.png","profile-leona.png","profile-lin-xiangfei.png",
    "profile-link.png","profile-lucky.png","profile-mai.png","profile-makoto.png","profile-morrigan.png",
    "profile-mr-karate.png","profile-nameless.png","profile-naruto.png","profile-orochi-iori.png",
    "profile-raidenn.png","profile-ralf.png","profile-ramon.png","profile-rolento.png","profile-ryu.png",
    "profile-saitama.png","profile-saysiu.png","profile-sie.png","profile-smoke.png","profile-strider.png",
    "profile-subzero.png","profile-vegeto.png","profile-vice.png","profile-wesker.png",
    "profile-wolverine.png","profile-yashiro.png"];
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

    let paramName = null;
    let paramEmail = null;
    let paramThumbnailUrl = null;
    let somethingChanged = false;

    if (this.newName.valueOf() !== this.profile.displayName.valueOf()) {
      paramName = this.newName;
      somethingChanged = true;
    }
    if (this.newEmail.valueOf() !== this.profile.email.valueOf()) {
      paramEmail = this.newEmail;
      somethingChanged = true;
    }
    if (this.newAvatarUrl.valueOf() !== this.profile.thumbnailUrl.valueOf()) {
      paramThumbnailUrl;
      somethingChanged = true;
    }

    if (!somethingChanged) {
      this.showToast("Nada para alterar!");
      return;
    }

    if (this.currentPassword === undefined || this.currentPassword.trim().length < 6) {
      this.showToast("Confirme as alterações digitando a sua senha de usuário!");
      return;
    }

    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.updateUserProfile(paramName, paramEmail
      , paramThumbnailUrl, this.profile, this.currentPassword).then(() => {
        if (paramName) {
          this.profile.displayName = paramName;
        }
        if (paramEmail) {
          this.profile.email = paramEmail;
        }
        if (paramThumbnailUrl) {
          this.profile.thumbnailUrl = paramThumbnailUrl;
        }
        loading.dismiss();
        this.showToast("Perfil atualizado com sucesso!");
        this.isEditMode = false;
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

}
