import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

@Injectable()
export class FirebaseService {
  public db: any;
  public fireAuth: any;
  public users: any;

  constructor(public http: Http) {
    console.log('Hello FirebaseService Provider');
    this.fireAuth = firebase.auth();
    this.users = firebase.database().ref('users');
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
}
