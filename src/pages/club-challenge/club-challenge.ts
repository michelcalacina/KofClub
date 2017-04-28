import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController
  , LoadingController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';
import { ChallengeModel, ChallengeStatus } from '../../model/challenge-model';

@IonicPage()
@Component({
  selector: 'page-club-challenge',
  templateUrl: 'club-challenge.html',
})
export class ClubChallenge {
  
  private club: ClubModel;
  private loading: any;
  isAdminLogged: boolean;
  private opponents: Array<UserProfileModel>;
  private loggedUser: UserProfileModel;

  // Challenges that I receive
  otherChallengesPending: Array<ChallengeModel>;
  otherChallengesAccepted: Array<ChallengeModel>;
  otherChallengesRefused: Array<ChallengeModel>;
  otherChallengesAccomplished: Array<ChallengeModel>;

  // Challenges that I create
  myChallengesPending: Array<ChallengeModel>;
  myChallengesAccepted: Array<ChallengeModel>;
  myChallengesRefused: Array<ChallengeModel>;
  myChallengesAccomplished: Array<ChallengeModel>;
  
  // Special challenges behavior.
  challengesAdminValidation: Array<ChallengeModel>;
  challengesCompleted: Array<ChallengeModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public firebaseService: FirebaseService, public loadingCtrl: LoadingController) {
    this.club = navParams.get("club");
    this.isAdminLogged = navParams.get("isAdmin");

    this.myChallengesPending = new Array<ChallengeModel>();
    this.myChallengesAccepted = new Array<ChallengeModel>();
    this.myChallengesRefused = new Array<ChallengeModel>();
    this.myChallengesAccomplished = new Array<ChallengeModel>();

    this.otherChallengesPending = new Array<ChallengeModel>();
    this.otherChallengesAccepted = new Array<ChallengeModel>();
    this.otherChallengesRefused = new Array<ChallengeModel>();
    this.otherChallengesAccomplished = new Array<ChallengeModel>();
    
    this.challengesAdminValidation = new Array<ChallengeModel>();
    this.challengesCompleted = new Array<ChallengeModel>();

    this.getLoggedUser();

    // Only for test please remove.
    if (this.club == undefined) {
      this.mockClubks();
      this.isAdminLogged = true;
    }
    //---------------remove later ---------------

    this.loadChallengesCurrentUser();
  }

  openChallengeCreateView() {
    let myChallenges = new Array<string>();
    let otherChallenges = new Array<string>();

    this.myChallengesPending.forEach(mcp => {
      myChallenges.push(mcp.challenged);
    });

    this.myChallengesAccepted.forEach(mcp => {
      myChallenges.push(mcp.challenged);
    });

    this.otherChallengesPending.forEach(mcp => {
      otherChallenges.push(mcp.challenged);
    });

    this.otherChallengesAccepted.forEach(mcp => {
      otherChallenges.push(mcp.challenged);
    });

    this.navCtrl.push('ClubChallengeCreateNew', 
    {
      "club": this.club,
      "myChallenges": myChallenges,
      "otherChallenges": otherChallenges
    });
  }

  ionViewDidLoad() {

  }

  getLoggedUser() {
    this.firebaseService.getUserProfile().then((user) => {
      this.loggedUser = user;
    });
  }

  // receive a array with arrays inside, first array contais my challengers,
  // second array contais challenge against me.
  // Third contains Opponents list.
  loadChallengesCurrentUser() {
    this.firebaseService.loadChallengeHomeDatas(this.club)
    .then((dataArray) => {
      let myChallenges: Array<ChallengeModel> = dataArray[0];
      let otherChallenges = dataArray[1];

      myChallenges.forEach(c => {
        switch (c.status) {
          case ChallengeStatus.PENDING:
            this.myChallengesPending.push(c);
            break;
          case ChallengeStatus.ACCEPTED:
            this.myChallengesAccepted.push(c);
            break;
          case ChallengeStatus.REFUSED:
            this.myChallengesRefused.push(c);
            break;
          case ChallengeStatus.ACCOMPLISHED:
            this.myChallengesAccomplished.push(c);
            break;
          case ChallengeStatus.ADMIN_VALIDATION:
            this.challengesAdminValidation.push(c);
            break;
          case ChallengeStatus.COMPLETED:
            this.challengesCompleted.push(c);
            break;
        }
      });

      otherChallenges.forEach(c => {
        switch (c.status) {
          case ChallengeStatus.PENDING:
            this.otherChallengesPending.push(c);
            break;
          case ChallengeStatus.ACCEPTED:
            this.otherChallengesAccepted.push(c);
            break;
          case ChallengeStatus.REFUSED:
            this.otherChallengesRefused.push(c);
            break;
          case ChallengeStatus.ACCOMPLISHED:
            this.otherChallengesAccomplished.push(c);
            break;
          case ChallengeStatus.ADMIN_VALIDATION:
            this.challengesAdminValidation.push(c);
            break;
          case ChallengeStatus.COMPLETED:
            this.challengesCompleted.push(c);
            break;
        }
      });

      this.loading.dismiss();
    }, (err) => {
      console.log(err);
      this.loading.dismiss();
    });

    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  getOpponentName(uid: string) {
    this.opponents.forEach(o => {
      if (o.getUid().valueOf() === uid.valueOf()) {
        return o.displayName.valueOf();
      }
    });
  }

  // Only for teste, delete this after conclusion
  mockClubks() {
    let j = {"creationDate":1492652673040
              ,"description":"ndjdkdkdkx"
              ,"thumbnailURL":"https://firebasestorage.googleapis.com/v0/b/kof-club.appspot.com/o/images%2Flogos%2FKoccFighters.png?alt=media&token=7b69926a-1caa-43bc-81f7-1c69a4090bbd"
              ,"title":"KoccFighters"
              ,"admins":{"KUlqGiIDjKYzW6f3abZWtTZc4S03": true}
            };

    let club1 = ClubModel.toClubModel(j);
    this.club = club1;
  }
  // ------------------------------REMOVE LATER-----------------
}
