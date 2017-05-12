import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
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

  constructor(private navCtrl: NavController, private navParams: NavParams
  , private firebaseService: FirebaseService, private formBuilder: FormBuilder
  , private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
  
    let EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
    this.navCtrl.push('Register');
  }

  resetPassword() {
    this.navCtrl.push('Resetpwd');
  }

  loginUser() {
    this.submitAttempt = true;
    if (!this.loginForm.valid) {
      return;
    }

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    loading.present();

    this.firebaseService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).then( () => {
      loading.dismiss();
      this.navCtrl.setRoot('Home');
    }, (err) => {
      this.submitAttempt = false;
      loading.dismiss();
      this.toastCtrl.create({
        message: "Falha, certifique-se de estar conectado e que suas credenciais estão corretas!",
        duration: 5000,
        dismissOnPageChange: true
      }).present();
    });
  }
}
