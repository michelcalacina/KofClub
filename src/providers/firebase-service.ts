import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';
import { AngularFire } from 'angularfire2';

import { ClubModel } from '../model/club-model';

const DB_ROOT_CLUBS = "/clubs/";
const DB_ROOT_USERS = "/users/";
const DB_ROOT_RANK = "/rank/";
const DB_ROOT_CLUBS_MEMBERS = "/clubs-members/";

// Storage
const ST_ROOT_IMAGES = "/images/";
const ST_PATH_LOGOS = ST_ROOT_IMAGES + "logos/";


@Injectable()
export class FirebaseService {
  // Authentication
  private fireAuth: any;
  
  // DataBase
  private usersRef: any;
  private clubsRef: any;
  private clubsMemberRef: any;

  constructor(public af: AngularFire) {
    this.fireAuth = firebase.auth();
    this.usersRef = firebase.database().ref(DB_ROOT_USERS);
    this.clubsRef = firebase.database().ref(DB_ROOT_CLUBS);
    this.clubsMemberRef = firebase.database().ref(DB_ROOT_CLUBS_MEMBERS);
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
    let fileName = clubName + ".png";
    return new Promise((resolve, reject) => {
      this.uploadBlob(dataBase64, fileName, ST_PATH_LOGOS)
        .then((downloadURL) => {
          let currentUserId = firebase.auth().currentUser.uid;
          // Save club on database.
          let club = new ClubModel();
          club.title = clubName;
          club.description = clubDescription;
          club.creationDate = firebase.database.ServerValue.TIMESTAMP;
          club.userAdmin = currentUserId;
          club.thumbnailURL = downloadURL;

          let newClubKey = this.clubsRef.push().key;

          let updates = {};
          updates[DB_ROOT_CLUBS + newClubKey] = club;
          updates[DB_ROOT_USERS + currentUserId + '/' + DB_ROOT_CLUBS + newClubKey] = true;
          // Update/Crete clubs-members with the new Club and default admin current user.
          updates[DB_ROOT_CLUBS_MEMBERS + newClubKey + '/' + currentUserId] = true;
          firebase.database().ref().update(updates).then( () => {
            resolve(true);
          });
      })
    });
  }

  private getClubsByKeys(listKeys: Array<string>): any {
    return new Promise( (resolve) => {
      
      let promiseCommands = listKeys.map(function(val,key) {
        return firebase.database().ref('clubs').child(val).once("value");
      });

      Promise.all(promiseCommands)
        .then(function (clubs) {
          let clubsList = clubs.map( club => {
            let c: ClubModel = ClubModel.toClubModel(club.val());
            c.setClubKey(club.key);
            return c;
          });
          
          resolve(clubsList);   
        })
    });
  }
  
  private getUserClubKeys(uid): any {
    return new Promise(resolve => {
      this.usersRef.child(uid).child('clubs')
      .once("value", snapshot => {
        var tempArray: string[] = [];
        // Convert Object Like {key: true, key: true}, to array of keys.
        for (let key in snapshot.val()) {
          tempArray.push(key);
        }
        resolve(tempArray);
      })
    });
  }

  /**
   * Get the clubs that logged user belong on it.
   */
  listCurrentUserClubs(): any {
    return new Promise((resolve,reject) => {
        let currentUid = firebase.auth().currentUser.uid;
        this.getUserClubKeys(currentUid)
        .then (clubKeys => {
          return this.getClubsByKeys(clubKeys)
        }).then( clubs => {
          return resolve(clubs);
        }).catch (err => {reject(err)});
    });
  }

  /**
   * Get all clubs.
   */
   listAllClubs(): any {
    return new Promise(resolve => {
      let clubsList: Array<ClubModel> = new Array;
      this.clubsRef.once("value", snapshots => {
        let clubs: Array<ClubModel> = new Array;
        snapshots.forEach(snapshot => {
          let club: ClubModel = ClubModel.toClubModel(snapshot.val());
          club.setClubKey(snapshot.key);
          clubs.push(club);
        });;
        resolve(clubs);
      });
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
