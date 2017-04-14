import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

@Injectable()
export class FirebaseService {
  // Authentication
  public fireAuth: any;
  
  // DataBase
  public users: any;
  public clubs: any;

  // Storage
  public clubImageThumbnail: any;

  constructor(public http: Http) {
    console.log('Hello FirebaseService Provider');
    this.fireAuth = firebase.auth();
    this.users = firebase.database().ref('users');
    this.clubs = firebase.database().ref('clubs');

    this.clubImageThumbnail = firebase.storage().ref('/clubs-thumbnail/');
  }

  login(email: string, password: string): any {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string, name: string): any {
    return this.fireAuth.createUserWithEmailAndPassword(email, password)
    .then(
      (newUser) => {
        this.users.child(newUser.uid).set({name: name, email: email});
      }
    )
  }

  resetPassword(email: string): any {
    return this.fireAuth.sendPassworResetEmail(email);
  }

  logout(): any {
    return this.fireAuth.signOut();
  }

  createClub(name: string, description: string
  , image: any): any {
    return ;
  }
}
