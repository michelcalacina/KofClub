import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
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
  loading: any;

  avatarUrl: string;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public formBuilder: FormBuilder
  , public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
  
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.registerForm = formBuilder.group({
      fullname: ['', Validators.compose([Validators.required, Validators.maxLength(30)])]
      , email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
      , password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });

    this.avatarUrl = "assets/img/profile-kusanagi.png";
  }

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  register() {
    this.submitAttempt = true;

    if (!this.registerForm.valid){
      return;
    }
    this.firebaseService.register(
    this.registerForm.value.email
    , this.registerForm.value.password
    , this.registerForm.value.fullname
    , this.avatarUrl
    ).then( authService => {
      this.navCtrl.setRoot('Home');
    }, error => {
      this.loading.dismiss().then( () => {
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

    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();
  }

}
