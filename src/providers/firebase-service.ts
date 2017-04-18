import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

import { ClubModel } from '../model/club-model';

var window: any;

@Injectable()
export class FirebaseService {
  // Authentication
  private fireAuth: any;
  
  // DataBase
  private usersRef: any;
  private clubsRef: any;

  // Storage
  private rootClubsLogo = "images/logo/";

  constructor(public http: Http) {
    this.fireAuth = firebase.auth();
    this.usersRef = firebase.database().ref('users');
    this.clubsRef = firebase.database().ref('clubs');
  }

  // Login control.
  login(email: string, password: string): any {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string, name: string): any {
    return this.fireAuth.createUserWithEmailAndPassword(email, password)
    .then(
      (newUser) => {
        this.usersRef.child(newUser.uid).set({name: name, email: email});
      }
    )
  }

  resetPassword(email: string): any {
    return this.fireAuth.sendPasswordResetEmail(email);
  }

  logout(): any {
    return this.fireAuth.signOut();
  }
  //-------------------------------------------

  // Club Control
  createClub(clubName: string, clubDescription: string
  , dataBase64: any): any {
    let fileName = clubName + "-logo" + ".png";
    return new Promise((resolve, reject) => {
      this.uploadBlob(dataBase64, fileName, this.rootClubsLogo)
        .then((downloadURL) => {
          let currentUserId = firebase.auth().currentUser.uid;
          // Save club on database.
          let club = new ClubModel();
          club.title = clubName;
          clubDescription = clubDescription;
          club.creationDate = firebase.database.ServerValue.TIMESTAMP;
          club.userAdmin = currentUserId;
          club.thumbnailURL = downloadURL;

          let newClubKey = this.clubsRef.push().key;
          let updates = {};
          updates['/clubes/' + newClubKey] = club;
          updates['/users/' + currentUserId + '/' + 'clubs/' + newClubKey] = true;

          firebase.database().ref().update(updates).then( () => {
            resolve(true);
          });
      })
    });
  }

  listCurrentUserClubs(): Promise<Array<any>>  {
    return new Promise(resolve => {

    });
  }

  // -----------------------------------------------

  // Util Control
  // Taken from: http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  private b64toBlob(b64Data): Promise<Blob> {
    return new Promise( (resolve, reject) => {
      let contentType = "image/png";
      let sliceSize = 512;
      
      let byteCharacters = atob(b64Data);
      let byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      resolve( new Blob(byteArrays, {type: contentType}) );
    })
  }

  private uploadBlob (fileBase64, fileName: string, baseStorageFilePath: string): any {
    return new Promise( (resolve, reject) => {
      this.b64toBlob(fileBase64).then (fileBlob => {
        let storageRef = firebase.storage().ref();
        let uploadTask = storageRef.child(baseStorageFilePath + fileName).put(fileBlob);
      
        uploadTask.on('state_changed', function (snapshot) {
          // Observe state change events such as progress, pause, and resume
          // See below for more detail
          console.log(snapshot);
        }, function(err) {

          reject(err);
        
        }, function() {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          var downloadURL = uploadTask.snapshot.downloadURL;
          resolve(downloadURL);
        });
      });
    });
  }

}
