import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
      this.clubs.push({
        thumbnail: "img/thumbnail-totoro.png"
      , title: "Kolonia fighters"
      , description: "Clube de jogadores da colônia antônio aleixo"
    })
    this.clubs.push({
        thumbnail: "img/thumbnail-totoro.png"
      , title: "John fighters"
      , description: "Clube de jogadores da colônia antônio aleixo"
      })
  }

  addClub() {
    
  }

}
