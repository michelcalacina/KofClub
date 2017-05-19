import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ModalController } from 'ionic-angular';

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
  isAdminLogged: boolean;
  private loggedUser: UserProfileModel;
  private hasEnterCreateNew: boolean;
  private isRefresh: boolean;

  // Challenges that I receive
  otherChallengesPending: Array<ChallengeModel>;

  // Challenges that I create
  myChallengesPending: Array<ChallengeModel>;
  
  // Special challenges behavior.
  challengesAdminValidation: Array<ChallengeModel>;
  challengesCompleted: Array<ChallengeModel>;
  challengesAccepted: Array<ChallengeModel>;
  challengesOtherUserAccomplished: Array<ChallengeModel>;
  challengesLoggedUserAccomplished: Array<ChallengeModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
   public firebaseService: FirebaseService, public loadingCtrl: LoadingController, 
   public modalCtrl: ModalController) {

    this.club = navParams.get("club");
    this.loggedUser = navParams.get("loggedUser");
    
    //Remove after refactory
    this.isAdminLogged = navParams.get("isAdmin");
    //------------------------------------------------------

    this.myChallengesPending = new Array<ChallengeModel>();
    this.otherChallengesPending = new Array<ChallengeModel>();
    
    this.challengesAdminValidation = new Array<ChallengeModel>();
    this.challengesCompleted = new Array<ChallengeModel>();
    this.challengesAccepted = new Array<ChallengeModel>();
    this.challengesLoggedUserAccomplished = new Array<ChallengeModel>();
    this.challengesOtherUserAccomplished = new Array<ChallengeModel>();

    this.hasEnterCreateNew = false;
    this.isRefresh = false;
  }

  openChallengeCreateView() {
    this.hasEnterCreateNew = true;
    let runningChallenges = new Array<string>();

    this.myChallengesPending.forEach(mcp => {
      runningChallenges.push(mcp.userChallenged.getUid());
    });

    this.challengesAccepted.forEach(mcp => {
      if (mcp.userChallenger.getUid().valueOf() !== this.loggedUser.getUid().valueOf()) {
        runningChallenges.push(mcp.userChallenger.getUid());
      } else {
        runningChallenges.push(mcp.userChallenged.getUid());
      }
    });

    this.otherChallengesPending.forEach(mcp => {
      runningChallenges.push(mcp.userChallenger.getUid());
    });

    this.navCtrl.push('ClubChallengeCreateNew', 
    {
      "club": this.club,
      "runningChallenges": runningChallenges,
      "loggedUser": this.loggedUser
    });
  }

  openLaunchResult(challenge: ChallengeModel) {
    let modalLaunchResult = this.modalCtrl.create("ModalChallengeLaunchResult", 
      {club: this.club, challenge: challenge, loggedUser: this.loggedUser
        , isLoggedAdmin: this.isAdminLogged});
    
    modalLaunchResult.onDidDismiss((result) => {
      if (result.success) {
        let index = this.challengesAccepted.indexOf(challenge);
        this.challengesAccepted.splice(index, 1);

        // Admins can save challenges without need of opponent confirmation.
        if (this.isAdminLogged) {
          this.challengesCompleted.push(result.challengeUpdated);
        } else {
          this.challengesLoggedUserAccomplished.push(result.challengeUpdated);
        }
      }
    });

    modalLaunchResult.present();
  }

  ionViewWillEnter() {
    this.loadChallengesCurrentUser();
  }

  // receive a array with arrays inside, first array contais my challengers,
  // second array contais challenge against me.
  loadChallengesCurrentUser() {
    // To avoid duplicity, clear all arrays.
    if (this.hasEnterCreateNew || this.isRefresh) {
      this.myChallengesPending = new Array<ChallengeModel>();
      this.otherChallengesPending = new Array<ChallengeModel>();
      
      this.challengesAdminValidation = new Array<ChallengeModel>();
      this.challengesCompleted = new Array<ChallengeModel>();
      this.challengesAccepted = new Array<ChallengeModel>();
      this.challengesLoggedUserAccomplished = new Array<ChallengeModel>();
      this.challengesOtherUserAccomplished = new Array<ChallengeModel>();
      this.hasEnterCreateNew = false;
      this.isRefresh = false;
    }

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true
    });
    loading.present();

    this.firebaseService.loadChallengeHomeDatas(this.club, this.isAdminLogged)
    .then((dataArray) => {
      let myChallenges: Array<ChallengeModel> = dataArray[0];
      let otherChallenges = dataArray[1];
      
      if (this.isAdminLogged) {
        dataArray[2].forEach(c => {
          this.challengesAdminValidation.push(c);
        });
      }

      myChallenges.forEach(c => {
        switch (c.status) {
          case ChallengeStatus.PENDING:
            this.myChallengesPending.push(c);
            break;
          case ChallengeStatus.ACCEPTED:
            this.challengesAccepted.push(c);
            break;
          case ChallengeStatus.ACCOMPLISHED:
            if (c.isResultByChallenger) {
              this.challengesLoggedUserAccomplished.push(c);
            } else {
              this.challengesOtherUserAccomplished.push(c);
            }
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
            this.challengesAccepted.push(c);
            break;
          case ChallengeStatus.ACCOMPLISHED:
            if (c.isResultByChallenger) {
              this.challengesOtherUserAccomplished.push(c);
            } else {
              this.challengesLoggedUserAccomplished.push(c);
            }
            break;
          case ChallengeStatus.ADMIN_VALIDATION:
            this.challengesAdminValidation.push(c);
            break;
          case ChallengeStatus.COMPLETED:
            this.challengesCompleted.push(c);
            break;
        }
      });

      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  acceptChallenge(challenge: ChallengeModel) {
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true
    })
    loading.present();

    this.firebaseService.acceptUserChallenge(challenge, this.club)
    .then((_) => {
      let index = this.otherChallengesPending.indexOf(challenge);
      this.otherChallengesPending.splice(index,1);
      this.challengesAccepted.push(challenge);
      loading.dismiss();
    }, (err) => {
      loading.dismiss();
    });
  }

  excludeChallenge(challenge: ChallengeModel) {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.excludeChallenge(challenge, this.club)
    .then((_) => {
      // Update the view.
      switch(challenge.status) {
        case ChallengeStatus.PENDING:
          // Verify it was created by me.
          let index = this.myChallengesPending.indexOf(challenge);
          if (index > -1) {
            this.myChallengesPending.splice(index,1);
          } else { // Otherwise remove from received challenges.
            index = this.otherChallengesPending.indexOf(challenge);
            this.otherChallengesPending.splice(index,1);
          }
          break;
        case ChallengeStatus.ACCEPTED:
          index = this.challengesAccepted.indexOf(challenge);
          this.challengesAccepted.splice(index,1);
          break;
      }
      loading.dismiss();
    }, (err) => {loading.dismiss();});
  }

  confirmAccomplishedChallenge(challenge: ChallengeModel) {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.firebaseService.confirmAccomplishedChallenge(challenge, this.club, this.isAdminLogged)
    .then((_) => {
        let index = this.challengesOtherUserAccomplished.indexOf(challenge);
        if (this.isAdminLogged && index < 0) {
          let i = this.challengesAdminValidation.indexOf(challenge);
          this.challengesAdminValidation.splice(i,1);
        } else {
          this.challengesOtherUserAccomplished.splice(index,1);
          this.challengesCompleted.push(challenge);
        }

        loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  refuseAccomplishedChallenge(challenge: ChallengeModel) {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();
    this.firebaseService.refuseAccomplishedChallenge(challenge, this.club, this.isAdminLogged)
    .then((_) => {
        let index = this.challengesOtherUserAccomplished.indexOf(challenge);
        this.challengesOtherUserAccomplished.splice(index,1);
        // If logged is admin, the challenge was removed on service, other wise still remain for validation.
        if (!this.isAdminLogged) {
          this.challengesAdminValidation.push(challenge);
        }
        loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  refresh() {
    this.isRefresh = true;
    this.loadChallengesCurrentUser();
  }
}
