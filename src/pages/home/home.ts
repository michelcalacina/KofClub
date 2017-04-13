import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service'
import firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  
  users: any;
  
  constructor(public navCtrl: NavController, private firebaseService: FirebaseService) {
    firebase.auth().onAuthStateChanged(function(user){
      if (!user) {
        navCtrl.setRoot('Login');
      }
    });
  }

  logout() {
    this.firebaseService.logout();
  }

}
