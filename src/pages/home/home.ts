import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  
  users: any;
  
  constructor(public navCtrl: NavController, private firebaseService: FirebaseService) {
    this.loadInitialUsers();
  }

  private loadInitialUsers() {
    this.firebaseService.db.on('value', function(snapshot) {
      alert(JSON.stringify(snapshot.val()) );
    })
  }

}
