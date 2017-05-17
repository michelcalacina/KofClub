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
  private newTitle = null;
  private newDescription = null;
  private newMaxMembers = 0;
  private minMembersQntd = 8;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private firebaseService: FirebaseService, private cameraService: CameraService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private socialSharing: SocialSharing) {

    this.club = navParams.get("club");
    this.isAdmin = navParams.get("isAdmin");
    this.isEditMode = false;
    this.newTitle = this.club.title;
    this.newDescription = this.club.description;
    this.newMaxMembers = this.club.maxMembers;

    if (this.club.qntdMembers > this.minMembersQntd) {
      this.minMembersQntd = this.club.qntdMembers;
    }
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
    if (this.newTitle.trim().length === 0) {
      this.showToastMessage("Nome do clã não pode estar em branco!", false);
      return;
    }

    if (this.newDescription.trim().length === 0) {
      this.showToastMessage("Descrição do clã não pode estar em branco!", false);
      return;
    }
    
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    let paramTitle = null;
    let paramDescription = null;
    let paramMaxMembers = 0;

    if (this.newTitle.valueOf() !== this.club.title) {
      paramTitle = this.newTitle.trim();
    }

    if (this.newDescription.valueOf() !== this.club.description) {
      paramDescription = this.newDescription.trim();
    }

    if (this.newMaxMembers !== this.club.maxMembers) {
      paramMaxMembers = this.newMaxMembers;
    }

    this.firebaseService.updateClub(paramTitle, paramDescription, paramMaxMembers
    , this.newPicture, this.club).then(objectResult => {
      // Update club
      if (paramTitle) {
        this.club.title = paramTitle;
      }

      if (paramDescription) {
        this.club.description = paramDescription;
      }

      if (paramMaxMembers > 0) {
        this.club.maxMembers = paramMaxMembers;
      }

      if (this.newPicture != null) {
        this.club.thumbnailURL = objectResult.newURL;
        this.club.logoName = objectResult.newLogoName;
      }

      loading.dismiss();
      this.showToastMessage("Alterações realizadas com sucesso!", true);
    }, (err) => {
      console.log(err);
      this.showToastMessage("Falha ao aplicar alterações!", false);
    });
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
