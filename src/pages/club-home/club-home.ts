import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';

@IonicPage()
@Component({
  selector: 'page-club-home',
  templateUrl: 'club-home.html',
})
export class ClubHome {

  public club: ClubModel;
  public qntdNewMembersPending = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.club = navParams.get("club");
    
    // Only for test please remove.
    if (this.club == undefined) {
      this.mockClubks();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClubHome');
  }

  // Only for teste, delete this after conclusion
  mockClubks() {
    let j = {"creationDate":1492652673040
              ,"description":"ndjdkdkdkx"
              ,"thumbnailURL":"https://firebasestorage.googleapis.com/v0/b/kof-club.appspot.com/o/images%2Flogos%2FKoccFighters.png?alt=media&token=7b69926a-1caa-43bc-81f7-1c69a4090bbd"
              ,"title":"KoccFighters"
              ,"userAdmin":"KUlqGiIDjKYzW6f3abZWtTZc4S03"}

    let club1 = ClubModel.toClubModel(j);
    this.club = club1;
  }

}
