import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ClubModel } from '../../model/club-model';

@IonicPage()
@Component({
  selector: 'page-user-clubs',
  templateUrl: 'user-clubs.html',
})
export class UserClubs {

  clubs: Array<any> = new Array;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mockAddFakeClubs();
  }

  // Only for teste purpose.
  private mockAddFakeClubs() {
    let club1 = new ClubModel(
        "Kolonia fighters"
        , "Clube de jogadores da colônia antônio aleixo"
        , "assets/img/club-colonia.png");
    
    let club2 = new ClubModel(
        "John fighters"
        , "Clube de jogadores da colônia antônio aleixo"
        , "assets/img/club-colonia.png");
    
    this.clubs.push(club1);
    this.clubs.push(club2);
  }

  createClub() {
    this.navCtrl.push('ClubCreateNew');
  }

  openClub(club) {
    this.navCtrl.push('ClubHome', {"club": club});
  }

}
