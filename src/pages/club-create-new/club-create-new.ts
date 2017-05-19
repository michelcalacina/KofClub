import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
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
  submitAttempt: boolean = false;
  nameChanged: boolean = false;
  descriptionChanged: boolean = false;
  isPictureTaken: boolean = false;
  pictureTaken: any;
  public base64declaration = "data:image/png;base64,";
  public maxMembers = 24;
  private isClubCreated = false;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public formBuilder: FormBuilder
  , public loadingCtrl: LoadingController, public toastCtrl: ToastController
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
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.cameraService.getPicture(false).then( (imageData) => {
      this.pictureTaken = imageData;
      this.isPictureTaken = true;
      loading.dismiss();
    }, (err) => {
      loading.dismiss();
    });
  }

  removeTakenPicture() {
    this.isPictureTaken = false;
    this.pictureTaken = null;
  }

  createClub() {
    if (!this.isPictureTaken) {
      this.showToastMessage("Logomarca não selecionada!", false);
      return;
    }

    if (!this.createClubForm.valid) {
      this.showToastMessage("Preenchimento incorreto!", false);
      return;
    }
    
    this.submitAttempt = true;
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.createClub(
    this.createClubForm.value.name
    , this.createClubForm.value.description
    , this.maxMembers
    , this.pictureTaken
    ).then( _ => {
      this.isClubCreated = true;
      loading.dismiss().then(()=>{
        this.showToastMessage(this.createClubForm.value.name + " criado com sucesso!", true);
      })
    }, error => {
      loading.dismiss().then(() => {
        this.showToastMessage(
          "Falha, por favor verifique a conexão com a internet, ou tente novamente mais tarde!"
          , false);
      });
    });
  }

  public getPicture(): string {
    return this.base64declaration + this.pictureTaken;
  }

  private showToastMessage(message: string, showClose: boolean) {
    let toast = this.toastCtrl.create({
      message: message,
      dismissOnPageChange: true,
      closeButtonText: "OK"
    });
    if (showClose) {
      toast.setShowCloseButton(true);
    } else {
      toast.setDuration(3000);
    }

    toast.onDidDismiss(() => {
      if (showClose) {
        this.navCtrl.pop();
      }
    });

    toast.present();
  }

  back() {
    this.navCtrl.pop();
  }

}
