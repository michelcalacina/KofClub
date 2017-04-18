import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

var window: any;

@Injectable()
export class FirebaseService {
  // Authentication
  public fireAuth: any;
  
  // DataBase
  public users: any;
  public clubs: any;

  constructor(public http: Http) {
    console.log('Hello FirebaseService Provider');
    this.fireAuth = firebase.auth();
    this.users = firebase.database().ref('users');
    this.clubs = firebase.database().ref('clubs');
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
  , dataUrl: any): any {
    
    return new Promise((resolve, reject) => {
      this.uploadFile(dataUrl).then((res) => {
        console.log("After send: "+res);
        // TODO save on database metadata for file.
        resolve(" Mock result for then ");
      }, (err) => {
        reject(err);
      });
    });
  }

  private uploadFile (fileBase64): any {
    return new Promise( (resolve, reject) => {
      this.b64toBlob(fileBase64).then (fileBlob => {
        let storageRef = firebase.storage().ref();
        let uploadTask = storageRef.child("images/myclublogo.png").put(fileBlob);
      
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
}
