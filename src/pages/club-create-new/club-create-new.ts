import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-club-create-new',
  templateUrl: 'club-create-new.html',
})
export class ClubCreateNew {

  public registerForm;
  loading: any;
  submitAttempt: boolean = false;
  public image: any;
  nameChanged: boolean = false;
  descriptionChanged: boolean = false;
  takenPicturePreview: any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public formBuilder: FormBuilder
  , public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    
    this.registerForm = formBuilder.group({
      name: ['', Validators.required]
      , description: ['', Validators.required]
    });
    
    this.takenPicturePreview = "assets/img/default-placeholder-picture.png";
  }

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  takePicture() {
    // TODO 
  }
  
  createClub() {
    this.submitAttempt = true;

    if (!this.registerForm.valid){
      return;
    }
    this.firebaseService.createClub(
    this.registerForm.value.name
    , this.registerForm.value.description
    , this.image
    ).then( authService => {
      this.navCtrl.getPrevious();
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
