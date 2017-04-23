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
  loading: any;
  submitAttempt: boolean = false;
  nameChanged: boolean = false;
  descriptionChanged: boolean = false;
  isPictureTaken: boolean = false;
  pictureTaken: any;
  public base64declaration = "data:image/png;base64,";

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

  removeTakenPicture() {
    this.isPictureTaken = false;
    this.pictureTaken = null;
  }

  createClub() {
    this.submitAttempt = true;

    if (!this.createClubForm.valid) {
      return;
    }
    if (!this.isPictureTaken) {
      this.showToastMessage("Nenhuma logomarca selecionada!", false);
      return;
    }

    this.firebaseService.createClub(
    this.createClubForm.value.name
    , this.createClubForm.value.description
    , this.pictureTaken
    ).then( _ => {
      this.loading.dismiss().then(()=>{
        this.showToastMessage(this.createClubForm.value.name + " criado com sucesso!", true);
      })
    }, error => {
      this.loading.dismiss().then( () => {
        this.showToastMessage(
          "Não consegui criar o club, talvez esteja com problema de conexão no momento!"
          , false);
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

}
