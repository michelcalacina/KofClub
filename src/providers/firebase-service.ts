import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

/*
  Generated class for the FirebaseService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FirebaseService {
  public db: any;
  public fireAuth: any;
  public userData: any;

  constructor(public http: Http) {
    console.log('Hello FirebaseService Provider');
    this.db = firebase.database().ref('users');
    this.fireAuth = firebase.auth();
    this.userData = firebase.database().ref('userData');
  }

  login(email: string, password: string): any {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string, name: string): any {
    return this.fireAuth.createUserWithEmailAndPassword(email, password)
    .then(
      (newUser) => {
        alert(JSON.stringify(newUser));
        this.userData.child(newUser.uid).set({name: name, email: email});
      }
    )
  }

  resetPassword(email: string): any {
    return this.fireAuth.sendPassworResetEmail(email);
  }

  logout(): any {
    return this.fireAuth.signOut();
  }
}
