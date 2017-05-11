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

  //clubs: Array<ClubModel> = new Array;
  clubKey: string;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public loadingCtrl: LoadingController, public firebaseService: FirebaseService
  , public toastCtrl: ToastController ) {

    //this.loadClubs();
  }

  back() {
    this.navCtrl.pop();
  }

  requestAccess() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    // TODO After refactory club quantity members.
  }

  // loadClubs() {
  //   this.loading = this.loadingCtrl.create({
  //     dismissOnPageChange: true,
  //   });
  //   this.loading.present();

  //   this.firebaseService.listClubsForUser()
  //   .then( clubs => {
  //     this.clubs = clubs;
  //     this.loading.dismiss();
  //   }, err => {
  //     this.loading.dismiss();
  //   });
  // }

  // requireAccessToClub(club: ClubModel) {
  //   this.firebaseService.requestAccessToClub(club)
  //   .then( res => {
  //     this.presentToast("Solicitação enviada!");
  //     club.setClubUserStatus(CLUB_USER_STATUS.PENDING);
  //   }, (err) => {
  //     this.presentToast("Não foi possível solicitar acesso ao club!", true);
  //   });
  // }

  // openUserClub(club) {
  //   this.navCtrl.push('ClubHome', {"club": club});
  // }

  // private presentToast(message: string, isShowButton: boolean = false) {
  //   let toast = this.toastCtrl.create({
  //     message: message,
  //     closeButtonText: "OK",
  //     dismissOnPageChange: true,
  //     position: "bottom",
  //     duration: 3000
  //   });
  //   if (isShowButton) {
  //     toast.setShowCloseButton(true);
  //   }

  //   toast.present();
  // }

  // isUserClubMember(club: ClubModel): boolean {
  //   return club.getClubUserStatus() === CLUB_USER_STATUS.MEMBER;
  // }

  // isUserClubNotMember(club: ClubModel): boolean {
  //   return club.getClubUserStatus() === CLUB_USER_STATUS.NOT_MEMBER;
  // }

  // isUserClubPendingMember(club: ClubModel): boolean {
  //   return club.getClubUserStatus() === CLUB_USER_STATUS.PENDING;
  // }

}
