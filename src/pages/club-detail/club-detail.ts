import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams
  , LoadingController, ToastController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { CameraService } from '../../providers/camera-service';

@IonicPage()
@Component({
  selector: 'page-club-detail',
  templateUrl: 'club-detail.html',
})
export class ClubDetail {

  private club: ClubModel;
  private isAdmin: boolean;
  private isEditMode: boolean;
  public base64declaration = "data:image/png;base64,";

  private newPicture = null;
  private newName = null;
  private newDescription = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private firebaseService: FirebaseService, private cameraService: CameraService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private socialSharing: SocialSharing) {

    this.club = navParams.get("club");
    this.isAdmin = navParams.get("isAdmin");
    this.isEditMode = false;
    this.newName = this.club.title;
    this.newDescription = this.club.description;
  }

  takePictureGallery() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.cameraService.getPicture(false).then( (imageData) => {
      loading.dismiss();
      this.newPicture = imageData;
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  public getPicture(): string {
    return this.base64declaration + this.newPicture;
  }

  shareKey() {
    let subject = "Chave de acesso ao club " + this.club.title;
    this.socialSharing.share(this.club.getClubKey(), subject, null, null);
  }

  saveChanges() {
    // TODO
  }

}
