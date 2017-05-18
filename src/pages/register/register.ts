import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, 
  AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class Register {

  public registerForm;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  fullnameChanged: boolean = false;
  submitAttempt: boolean = false;

  avatarUrl: string;

  private avatares: Array<string>;
  private currentAvatarIndex: number;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public formBuilder: FormBuilder
  , public alertCtrl: AlertController, public loadingCtrl: LoadingController
  , public toastCtrl: ToastController) {
  
    let EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.registerForm = formBuilder.group({
      fullname: ['', Validators.compose([Validators.required, Validators.maxLength(30)])]
      , email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
      , password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });

    this.avatarUrl = "assets/img/flick-right.png";
    this.avatares = ["profile-abel.png","profile-akuma.png","profile-alba.png","profile-amaterasu.png",
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
    this.currentAvatarIndex = -1;
  }

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  register() {
    this.submitAttempt = true;

    if (this.currentAvatarIndex === -1) {
      this.toastCtrl.create({
        duration: 3000,
        message: "Selecione um avatar deslizando o dedo!"
      }).present();
      this.submitAttempt = false;
      return;
    }

    if (!this.registerForm.valid){
      return;
    }

    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.register(
    this.registerForm.value.email
    , this.registerForm.value.password
    , this.registerForm.value.fullname
    , this.avatarUrl
    ).then( authService => {
      loading.dismiss();
      this.navCtrl.setRoot('Home');
    }, error => {
      loading.dismiss().then( () => {
        let alert = this.alertCtrl.create({
          message: error.message,
          buttons: [
            {
              text: "Ok",
              role: 'cancel'
            }
          ]
        });
        alert.present();
      });
    });
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

    this.avatarUrl = "assets/img/"+this.avatares[this.currentAvatarIndex];
  }

}
