import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import firebase from 'firebase';
import { AngularFire } from 'angularfire2';

import { ClubModel, CLUB_USER_STATUS } from '../model/club-model';
import { UserProfileModel } from '../model/user-profile-model';

const DB_ROOT_CLUBS = "/clubs/";
const DB_ROOT_USERS = "/users/";
const DB_ROOT_RANK = "/rank/";
const DB_ROOT_CLUBS_MEMBERS = "/clubs-members/";
// List all pending users by club, useful for admin.
const DB_ROOT_JOIN_CLUBS_MEMBERS = "/join-clubs-members/";
// List all pending clubs by user, useful for user join view.
const DB_ROOT_JOIN_MEMBERS_CLUBS = "/join-members-clubs/";

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

  // Common
  private UserProfile: UserProfileModel;

  constructor(public af: AngularFire) {
    this.fireAuth = firebase.auth();
    this.usersRef = firebase.database().ref(DB_ROOT_USERS);
    this.clubsRef = firebase.database().ref(DB_ROOT_CLUBS);
    this.clubsMemberRef = firebase.database().ref(DB_ROOT_CLUBS_MEMBERS);
  }

  // Login control.
  login(email: string, password: string): any {
    return new Promise((resolve,reject) => {
      this.fireAuth.signInWithEmailAndPassword(email, password)
      .then((snapshot) => {
        let uid = firebase.auth().currentUser.uid;
        this.usersRef.child(uid)
        .once('value', usnapshot => {
          if (usnapshot.val() !== null) {
            let userProfile = new UserProfileModel();
            userProfile.setUid = usnapshot.key;
            userProfile.creationDate = usnapshot.val().creationDate;
            userProfile.displayName = usnapshot.val().displayName;
            userProfile.email = usnapshot.val().email;
            userProfile.thumbnailUrl = usnapshot.val().thumbnailUrl;
            
            let objClubs = usnapshot.val().clubs;
            if (objClubs != null && objClubs != undefined) {
              for (let c in objClubs) {
                userProfile.clubs.push(new String(c));
              }
            }
            // Current userProfile for general app use.
            this.UserProfile = userProfile;
            resolve(true);
          } else {
            reject("Invalid User Profile");
          }
        });
      }, (err) => {
        reject(err);
      });
    });
    
  }

  register(email: string, password: string, name: string, thumbnail: string): any {
    return new Promise((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(email, password)
        .then(
          (newUser) => {
            let userProfile = new UserProfileModel();
            userProfile.displayName = name;
            userProfile.email = email;
            userProfile.creationDate = firebase.database.ServerValue.TIMESTAMP;
            userProfile.thumbnailUrl = thumbnail;
            userProfile.setUid(newUser.uid);
            let update = {};
            update[DB_ROOT_USERS + newUser.uid] = userProfile.toJSON();
            
            // Update user profile db.
            firebase.database().ref().update(update).then( _ => {
              // after update login with new user.
              this.login(email, password).then( _ => {
                resolve(true);
              });
            }, (err) => {reject(err)});
          }
        )
    }); 
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
          club.thumbnailURL = downloadURL;
          club.admins.push(uid);

          let newClubKey = this.clubsRef.push().key;

          let updates = {};
          updates[DB_ROOT_CLUBS + newClubKey] = club.toJSON();
          // create the admin field separeted, array not works.
          //updates[DB_ROOT_CLUBS + newClubKey + '/' + 'admins' + '/' + uid] = true;
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
          let clubList: Array<ClubModel> = new Array<ClubModel>();
          clubs.forEach( club => {
            if (club.val() !== null) {
              let c: ClubModel = ClubModel.toClubModel(club.val());
              c.setClubKey(club.key);
              clubList.push(c);
            }
          });
                    
          resolve(clubList);   
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
      firebase.database().ref(DB_ROOT_JOIN_MEMBERS_CLUBS).child(uid)
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
      update[DB_ROOT_JOIN_CLUBS_MEMBERS + club.getClubKey() + '/' + uid] = true;
      update[DB_ROOT_JOIN_MEMBERS_CLUBS + uid + '/' + club.getClubKey()] = true; 
      firebase.database().ref().update(update).then( _ => {
        resolve(true)
      }).catch( err => reject(err) );
    });
  }


  getPendingRequestToEnterClub(club: ClubModel): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      firebase.database().ref(DB_ROOT_JOIN_CLUBS_MEMBERS).child(club.getClubKey())
      .once('value', snapshot => {
        let userKeys = new Array<string>();
        for (let userKey in snapshot.val()) {
          userKeys.push(userKey);
        }
        resolve(userKeys);
      }, (err) => {
        reject(err);
      });
    });
  }

  listPendingUsersClub(club: ClubModel, userKeys: Array<string>): Promise<UserProfileModel> {
    return new Promise((resolve, reject) => {
      // TODO
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

  // The LoggedUser profile, include thumbnail further more informations.
  getUserProfile() {
    return this.UserProfile;
  }

}
