import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../../providers/firebase-service';
import { CameraService } from '../../providers/camera-service';

@IonicPage()
@Component({
  selector: 'page-club-create-new',
  templateUrl: 'club-create-new.html',
})
export class ClubCreateNew {

  public createClubForm;
  loading: any;
  submitAttempt: boolean = false;
  nameChanged: boolean = false;
  descriptionChanged: boolean = false;
  isPictureTaken: boolean = false;
  pictureTaken: any;
  public base64declaration = "data:image/png;base64,";

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public formBuilder: FormBuilder
  , public alertCtrl: AlertController, public loadingCtrl: LoadingController
  , public cameraService: CameraService) {
    
    this.createClubForm = formBuilder.group({
      name: ['', Validators.required]
      , description: ['', Validators.required]
    });
  }

  elementChanged(input) {
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  takePictureGallery() {
    this.cameraService.getPicture(false).then( (imageData) => {
      this.loading.dismiss().then( () => {
        //this.pictureTaken = 'data:image/png;base64,' + imageData;
        this.pictureTaken = imageData;
        this.isPictureTaken = true;
      });
    }, (err) => {
      this.loading.dismiss();
    });

    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present(); 
  }
  
  takePictureCamera() {
    this.cameraService.getPicture(true).then( picture => {
      this.pictureTaken = picture;
      this.isPictureTaken = true;
      console.log(picture);
      this.loading.dismiss();
    }, err => { 
      console.log(err);
      this.loading.dismiss(); 
    });

    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present(); 
  }

  removeTakenPicture() {
    this.isPictureTaken = false;
    this.pictureTaken = null;
  }

  createClub() {
    this.submitAttempt = true;

    if (!this.createClubForm.valid){
      return;
    }
    this.firebaseService.createClub(
    this.createClubForm.value.name
    , this.createClubForm.value.description
    , this.pictureTaken
    ).then( _ => {
      this.loading.dismiss().then(()=>{
        let mAlert = this.alertCtrl.create({
          title: "FEITO",
          message: "Que os duelos comecem!",
          buttons: [
            {
              text: "Ok",
              handler: () => {
                this.navCtrl.pop();
              }
            }
          ],
        });
        mAlert.present();
      })
    }, error => {
      this.loading.dismiss().then( () => {
        let alert = this.alertCtrl.create({
          message: error.message,
          buttons: [
            {
              text: "Ok",
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

  public getPicture(): string {
    return this.base64declaration + this.pictureTaken;
  }

}
