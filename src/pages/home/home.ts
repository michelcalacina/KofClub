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
    //this.loadInitialUsers();
    firebase.auth().onAuthStateChanged(function(user){
      if (!user) {
        navCtrl.setRoot('Login');
      }
    });
  }

  private loadInitialUsers() {
    this.firebaseService.db.on('value', function(snapshot) {
      console.log(snapshot.key + " -- " + JSON.stringify(snapshot.val()) );
    })
  }

}
