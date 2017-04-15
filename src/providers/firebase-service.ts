import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { FilePath } from 'ionic/native';

import firebase from 'firebase';

@Injectable()
export class FirebaseService {
  // Authentication
  public fireAuth: any;
  
  // DataBase
  public users: any;
  public clubs: any;

  // Storage
  public storage: any;

  constructor(public http: Http) {
    console.log('Hello FirebaseService Provider');
    this.fireAuth = firebase.auth();
    this.users = firebase.database().ref('users');
    this.clubs = firebase.database().ref('clubs');

    this.storage = firebase.storage();
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
  , fileNativePath: any): any {
    alert("firebase create club");
    this.uploadFile(fileNativePath).then((res) => {
      alert(JSON.stringify(res));
    }, (err) => {
      alert(JSON.stringify(err));
    });

    return;
  }

  private uploadFile (fileNativePath): any {
    alert(fileNativePath);
    //FilePath.resolveLocalFileSystemURL(fileNativePath)
    // Not working fix this, need discover how create file.
    (<any>window).resolveLocalFileSystemURL(fileNativePath), (res) => {
      alert('first res')
      res.file((resFile) => {
        alert('resFile')
        let reader = new FileReader();
        reader.readAsArrayBuffer(resFile);
        reader.onloadend = (evt: any) => {
          alert("evt "+evt);
          let imgBlob = new Blob([evt.target.result], {type: 'image/png'});
          let fileStorage = this.storage.child("clubs-logo");
          return fileStorage.put(imgBlob);
        }
      })
    }, (err) => {
      alert("erro no resolveLocal..." + err);  
    }
  }
}
