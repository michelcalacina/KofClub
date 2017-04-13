import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  public loginForm;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public formBuilder: FormBuilder
  , public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
  
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  elementChanged(input) {
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  register() {
    this.navCtrl.push('RegisterPage');
  }

  resetPassword() {
    this.navCtrl.push('ResetpwdPage');
  }

  loginUser() {
    this.submitAttempt = true;

    if (!this.loginForm.valid) {
      return;
    }

    this.firebaseService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).then( FirebaseService => {
      this.navCtrl.setRoot('HomePage');
    }, error => {
      this.loading.dismiss().then( () => {
        let alert = this.alertCtrl.create({
          message: error.message,
          buttons: [
            {
              text: "OK",
              role: 'cancel'
            }
          ]
        });
        alert.present();
      })
    });

    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    })

    this.loading.present();
  }
}
