import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ClubModel, CLUB_USER_STATUS } from '../../model/club-model';

import { FirebaseService } from '../../providers/firebase-service';

/**
 * List entire clubs
 */
@IonicPage()
@Component({
  selector: 'page-clubs',
  templateUrl: 'clubs.html',
})
export class Clubs {

  loading: any;
  clubs: Array<ClubModel> = new Array;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService
  , public toastCtrl: ToastController ) {

    this.loadClubs();
    // Only for teste.
    //this.mockClubks();
  }

  loadClubs() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    this.firebaseService.listClubsForUser()
    .then( clubs => {
      this.clubs = clubs;
      this.loading.dismiss();
    }, err => {
      this.loading.dismiss();
    });
  }

  requireAccessToClub(club: ClubModel) {
    this.firebaseService.requestAccessToClub(club)
    .then( res => {
      this.presentToast("Solicitação enviada!")
    }, (err) => {
      this.presentToast(err, true);
    });
  }

  openUserClub(club) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

  private presentToast(message: string, isShowButton: boolean = false) {
    let toast = this.toastCtrl.create({
      message: message,
      closeButtonText: "OK",
      dismissOnPageChange: true,
      position: "bottom",
      duration: 3000
    });
    if (isShowButton) {
      toast.setShowCloseButton(true);
    }

    toast.present();
  }

  // Only for teste, delete this after conclusion
  mockClubks() {
    let j = {"creationDate":1492652673040
              ,"description":"ndjdkdkdkx"
              ,"thumbnailURL":"https://firebasestorage.googleapis.com/v0/b/kof-club.appspot.com/o/images%2Flogos%2FKoccFighters.png?alt=media&token=7b69926a-1caa-43bc-81f7-1c69a4090bbd"
              ,"title":"KoccFighters"
              ,"userAdmin":"KUlqGiIDjKYzW6f3abZWtTZc4S03"}

    let club1 = ClubModel.toClubModel(j);
    let club2 = ClubModel.toClubModel(j);

    //club1.setIsClubLoggedUser(true);
    club1.setClubUserStatus(CLUB_USER_STATUS.MEMBER);

    this.clubs.push(club1);
    this.clubs.push(club2);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Clubs');
  }

  isUserClubMember(club: ClubModel): boolean {
    return club.getClubUserStatus() === CLUB_USER_STATUS.MEMBER;
  }

  isUserClubNotMember(club: ClubModel): boolean {
    return club.getClubUserStatus() === CLUB_USER_STATUS.NOT_MEMBER;
  }

  isUserClubPendingMember(club: ClubModel): boolean {
    return club.getClubUserStatus() === CLUB_USER_STATUS.PENDING;
  }

}
