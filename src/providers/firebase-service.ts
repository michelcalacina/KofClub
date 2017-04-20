import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';
import { AngularFire } from 'angularfire2';

import { ClubModel, CLUB_USER_STATUS } from '../model/club-model';

const DB_ROOT_CLUBS = "/clubs/";
const DB_ROOT_USERS = "/users/";
const DB_ROOT_RANK = "/rank/";
const DB_ROOT_CLUBS_MEMBERS = "/clubs-members/";
// List all pending users by club, useful for admin.
const DB_ROOT_CLUBS_JOIN_MEMBERS = "/clubs-join-members/";
// List all pending clubs by user, useful for user join view.
const DB_ROOT_MEMBERS_JOIN_CLUBS = "/members-join-clubs/";

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
          let uid = firebase.auth().currentUser.uid;
          // Save club on database.
          let club = new ClubModel();
          club.title = clubName;
          club.description = clubDescription;
          club.creationDate = firebase.database.ServerValue.TIMESTAMP;
          club.userAdmin = uid;
          club.thumbnailURL = downloadURL;

          let newClubKey = this.clubsRef.push().key;

          let updates = {};
          updates[DB_ROOT_CLUBS + newClubKey] = club.toJSON();
          updates[DB_ROOT_USERS + uid + DB_ROOT_CLUBS + newClubKey] = true;
          // Update/Crete clubs-members with the new Club and default admin current user.
          updates[DB_ROOT_CLUBS_MEMBERS + newClubKey + '/' + uid] = true;
          firebase.database().ref().update(updates).then( () => {
            resolve(true);
          }).catch( err => {reject(err)});
      })
    });
  }

  private getClubsByKeys(listKeys: Array<string>): any {
    return new Promise( (resolve) => {
      
      let promiseCommands = listKeys.map(function(val,key) {
        return firebase.database().ref('clubs').child(val).once('value');
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
  
  private getUserClubKeys(uid): Promise<Array<string>> {
    return new Promise(resolve => {
      this.usersRef.child(uid).child('clubs')
      .once("value", snapshot => {
        let keys: string[] = [];
        // Convert Object Like {key: true, key: true}, to array of keys.
        for (let key in snapshot.val()) {
          keys.push(key);
        }
        resolve(keys);
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

  private getUserPendingJoinClubs(uid: string): Promise<Array<string>> {
    return new Promise( (resolve, reject) => {
      firebase.database().ref(DB_ROOT_MEMBERS_JOIN_CLUBS).child(uid)
      .once('value', snapshot => {
        let joinClubKeys: string[] = [];
        // Convert Object Like {key: true, key: true}, to array of keys.
        for (let key in snapshot.val()) {
          joinClubKeys.push(key);
        } 
        resolve(joinClubKeys);
      }, err => {reject(err)});
    });
  }

  private getAllClubs(): Promise<Array<ClubModel>> {
    return new Promise( (resolve, reject) => {
      this.clubsRef.once('value', snapshots => {
        let clubs: Array<ClubModel> = new Array;
        snapshots.forEach(snapshot => {
          let club: ClubModel = ClubModel.toClubModel(snapshot.val());
          club.setClubKey(snapshot.key);
          clubs.push(club);
        });
        resolve(clubs);
      });
    });
  }

  /**
   * Get all clubs.
   */
  listClubsForUser(): any {
    let uid = firebase.auth().currentUser.uid;
    return new Promise( (resolve, reject) => {
      Promise.all([this.getAllClubs(), 
                  this.getUserClubKeys(uid),
                  this.getUserPendingJoinClubs(uid)])
      .then(data => {
        let allClubs = data[0];
        let userClubsKeys = data[1];
        let pendingUserJoinClubs = data[2];

        for (let c of allClubs) {
          let clubKey = c.getClubKey().valueOf();
          // current user belong to this club.
          if (userClubsKeys.length > 0 && userClubsKeys.indexOf(clubKey) > -1) {
            c.setClubUserStatus(CLUB_USER_STATUS.MEMBER);
          } // current user wait for aproval to became member of clube.
          else if (pendingUserJoinClubs.length > 0 
                      && pendingUserJoinClubs.indexOf(clubKey) > -1) {
            c.setClubUserStatus(CLUB_USER_STATUS.PENDING);
          } else {
            c.setClubUserStatus(CLUB_USER_STATUS.NOT_MEMBER);
          }
        }
        resolve(allClubs);
      }, err => {reject(err)});
    });
  }

   requestAccessToClub(club: ClubModel): Promise<any> {
     return new Promise( (resolve, reject) => {
        let uid = firebase.auth().currentUser.uid;
        let clubKey = club.getClubKey();
        // Uses update to keep the structe on db: root/clubkey/uid: true.
        let update = {};
        update[DB_ROOT_CLUBS_JOIN_MEMBERS + club.getClubKey() + '/' + uid] = true;
        update[DB_ROOT_MEMBERS_JOIN_CLUBS + uid + '/' + club.getClubKey()] = true; 
        firebase.database().ref().update(update).then( _ => {
          resolve(true)
        }).catch( err => reject(err) );
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
