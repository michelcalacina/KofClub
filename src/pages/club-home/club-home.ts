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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.club = navParams.get("club");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClubHome');
  }

}
