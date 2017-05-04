import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

import { ClubModel, CLUB_USER_STATUS } from '../model/club-model';
import { UserProfileModel } from '../model/user-profile-model';
import { ChallengeModel, ChallengeStatus } from '../model/challenge-model';
import { ChallengeProfileModel } from '../model/challenge-profile-model';

const DB_ROOT_CLUBS = "/clubs/";
const DB_ROOT_USERS = "/users/";
const DB_ROOT_CLUBS_RANK = "/clubs-rank/";

const DB_ROOT_CLUB_MEMBERS = "/club-members/";
const DB_ROOT_MEMBER_CLUBS = "/member-clubs/";
// List all pending users by club, useful for admin.
const DB_ROOT_JOIN_CLUB_MEMBERS = "/join-club-members/";
// List all pending clubs by user, useful for user join view.
const DB_ROOT_JOIN_MEMBER_CLUBS = "/join-member-clubs/";

const DB_ROOT_CHALLENGES = "/challenges/";
// Store from challenger to challenged. Get that who, I do wish to challenge.
const DB_ROOT_CLUB_CHALLENGER = "/club-challenger/";
// Store from challenged to challenger. Get that who, wish do challenge me.
const DB_ROOT_CLUB_CHALLENGED = "/club-challenged/";
const DB_ROOT_CHALLENGES_ADMIN_VALIDATION = "/challenges-admin-validation/";
const DB_ROOT_EVENT_CHALLENGES = "/event-challenges/";

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
  private clubMembersRef: any;
  private memberClubsRef: any;
  private challengesRef: any;
  private clubChallengerRef: any;
  private clubChallengedRef: any;
  private challengesAdminValidationRef: any;
  private eventChallengesRef: any;

  // Common
  private userProfile: UserProfileModel;

  constructor() {
    this.fireAuth = firebase.auth();
    this.usersRef = firebase.database().ref(DB_ROOT_USERS);
    this.clubsRef = firebase.database().ref(DB_ROOT_CLUBS);
    this.clubMembersRef = firebase.database().ref(DB_ROOT_CLUB_MEMBERS);
    this.memberClubsRef = firebase.database().ref(DB_ROOT_MEMBER_CLUBS);
    this.challengesRef = firebase.database().ref(DB_ROOT_CHALLENGES);
    this.clubChallengerRef = firebase.database().ref(DB_ROOT_CLUB_CHALLENGER);
    this.clubChallengedRef = firebase.database().ref(DB_ROOT_CLUB_CHALLENGED);
    this.challengesAdminValidationRef = firebase.database().ref(DB_ROOT_CHALLENGES_ADMIN_VALIDATION);
    this.eventChallengesRef = firebase.database().ref(DB_ROOT_EVENT_CHALLENGES);
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
            userProfile.setUid(usnapshot.key);
            userProfile.creationDate = usnapshot.val().creationDate;
            userProfile.displayName = usnapshot.val().displayName;
            userProfile.email = usnapshot.val().email;
            userProfile.thumbnailUrl = usnapshot.val().thumbnailUrl;
            
            // Current userProfile for general app use.
            this.userProfile = userProfile;
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

          updates[DB_ROOT_MEMBER_CLUBS + uid + '/' + newClubKey] = true;
          // Update/Crete clubs-members with the new Club and default admin current user.
          updates[DB_ROOT_CLUB_MEMBERS + newClubKey + '/' + uid] = true;

          // Create the rank for the admin user.
          updates[DB_ROOT_CLUBS_RANK + newClubKey 
          + '/' + uid] = {
                          totalWins: 0, 
                          totalLoses: 0, 
                          totalChallenges: 0,
                          experience: 0
                         };
          firebase.database().ref().update(updates).then( () => {
            resolve(true);
          }).catch( err => {reject(err)});
      })
    });
  }

  /**
   * Get the clubs that logged user belong on it.
   */
  listCurrentUserClubs(): Promise<Array<ClubModel>> {
    return new Promise((resolve,reject) => {
        let currentUid = firebase.auth().currentUser.uid;
        this.getUserClubKeys(currentUid)
        .then (clubKeys => {
          if (clubKeys.length > 0) {
            this.getClubsByKeys(clubKeys).then(clubs => {
              resolve(clubs);
            });
          } else {
            resolve(new Array<ClubModel>())
          }
        })
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
      update[DB_ROOT_JOIN_CLUB_MEMBERS + club.getClubKey() + '/' + uid] = true;
      update[DB_ROOT_JOIN_MEMBER_CLUBS + uid + '/' + club.getClubKey()] = true; 
      firebase.database().ref().update(update).then( _ => {
        resolve(true)
      }).catch( err => reject(err) );
    });
  }

  getPendingRequestToEnterClub(club: ClubModel): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      firebase.database().ref(DB_ROOT_JOIN_CLUB_MEMBERS).child(club.getClubKey())
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

  listPendingUsersClub(club: ClubModel, userKeys: Array<string>): Promise<Array<UserProfileModel>> {
    return new Promise((resolve, reject) => {
      let commands = userKeys.map((value, key) => {
        return this.usersRef.child(value).once('value');
      });

      Promise.all(commands)
      .then(snapshots => {
        let users = new Array<UserProfileModel>();
        snapshots.forEach(snapshot => {
          // Ignore garbage datas.
          if (snapshot === null)
            return;

          let user = new UserProfileModel();
          user.displayName = snapshot.val().displayName;
          user.email = snapshot.val().email;
          user.creationDate = snapshot.val().creationDate;
          user.thumbnailUrl = snapshot.val().thumbnailUrl;
          user.setUid(snapshot.key);
          users.push(user);
        });
        resolve(users);
      })
      .catch((err) => {reject(err)});
    });
  }

  acceptPendingUsersToClub(users: Array<UserProfileModel>, club: ClubModel): Promise<any> {
    return new Promise((resolve, reject) => {
      // Update each user in db user and db clubs
      let commands = {};      
      users.forEach(user => {
        // Add
        commands[
          DB_ROOT_MEMBER_CLUBS
          + user.getUid()
          + '/' + club.getClubKey()] = true;
        
        commands[
          DB_ROOT_CLUB_MEMBERS
          + club.getClubKey()
          + "/" + user.getUid()] = true;

        //Remove
        commands[
          DB_ROOT_JOIN_CLUB_MEMBERS
          + club.getClubKey()
          + "/" + user.getUid()] = null;

        commands[
          DB_ROOT_JOIN_MEMBER_CLUBS
          + user.getUid()
          + "/" + club.getClubKey()] = null;

          // Add to rank
          commands[DB_ROOT_CLUBS_RANK + club.getClubKey() 
          + '/' + user.getUid()] = {
                          totalWins: 0, 
                          totalLoses: 0, 
                          totalChallenges: 0,
                          experience: 0
                         };
      });

      firebase.database().ref().update(commands)
      .then( (_) => {
        resolve(true);
      }).catch((err) => {reject(err)});
    });
  }

  rejectPendingUsersToClub(users: Array<UserProfileModel>, club: ClubModel): Promise<any> {
    return new Promise((resolve, reject) => {
      // Update each user in db user and db clubs
      let commands = {};      
      users.forEach(user => {
        //Remove
        commands[
          DB_ROOT_JOIN_CLUB_MEMBERS
          + club.getClubKey()
          +"/"+ user.getUid()] = null;

        commands[
          DB_ROOT_JOIN_MEMBER_CLUBS
          + user.getUid()
          +"/"+ club.getClubKey()] = null;
      });

      firebase.database().ref().update(commands)
      .then( (_) => {
        resolve(true);
      }).catch((err) => {reject(err)});
    });
  }

  getClubOtherMembers(club: ClubModel): Promise<Array<UserProfileModel>> {
    return new Promise((resolve,reject) => {
      this.getClubMemberKeys(club).then((userKeys: Array<string>) => {
        let commands = userKeys.map((val, key) => {
          return this.usersRef.child(val).once('value');
        });

        Promise.all(commands).then(snapshots => {
          let users = new Array<UserProfileModel>();
          snapshots.forEach(element => {
            let user = new UserProfileModel();
            user.setUid(element.key);
            user.creationDate = element.val().creationDate;
            user.displayName = element.val().displayName;
            user.email = element.val().email;
            user.thumbnailUrl = element.val().thumbnailUrl;

            users.push(user);
          });
          resolve(users);
        }, (err) => {reject(err)});
      });
    });
  }

  // -----------------------------------------------

  // Challenge Control

  loadChallengeHomeDatas(club: ClubModel, isAdmin: boolean): Promise<Array<Array<ChallengeModel>>> {
    return new Promise((resolve,reject) => {
      Promise.all([
        this.getUserChallengerList(club),
        this.getUserChallengedList(club),
        this.getClubOtherMembers(club),
        this.getUserProfile()
      ]).then(data => {
        let myChallenges = data[0];
        let otherChallenges = data[1];
        let opponents = data[2];
        let loggedUser = data[3];
        
        // Logged user has created this challenges, configure the opponents.
        myChallenges.forEach( mc => {
          mc.userChallenger = loggedUser;
          opponents.forEach(o => {
            if (mc.userChallengedId.valueOf() === o.getUid().valueOf()) {
              mc.userChallenged = o;
            }
          });
        });

        // Other users has created this challenges, they challenges me.
        otherChallenges.forEach( oc => {
          oc.userChallenged = loggedUser;
          opponents.forEach(o => {
            if (oc.userChallengerId.valueOf() === o.getUid().valueOf()) {
              oc.userChallenger = o;
            }
          });
        });

        let result = new Array<Array<ChallengeModel>>();
        result.push(myChallenges);
        result.push(otherChallenges);
        
        if (isAdmin) {
          this.getChallengeAdminValidation(club)
          .then(challengesValidation => {
            challengesValidation.forEach(cv => {
              // Search first for challenger
              if (cv.userChallengerId.valueOf() === loggedUser.getUid().valueOf()) {
                cv.userChallenger = loggedUser;
              } else {
                opponents.forEach(o => {
                  if (cv.userChallengerId.valueOf() === o.getUid().valueOf()) {
                    cv.userChallenger = o;
                  }
                });
              }

              // Search for challenged
              if (cv.userChallengedId.valueOf() === loggedUser.getUid().valueOf()) {
                cv.userChallenged = loggedUser;
              } else {
                opponents.forEach(o => {
                  if (cv.userChallengedId.valueOf() === o.getUid().valueOf()) {
                    cv.userChallenged = o;
                  }
                });
              }
            });

            result.push(challengesValidation);
            resolve(result);
          });
        } else {
          resolve(result);
        }
      }, (err) => {reject(err)});
    });
  }

  createChallenge(club: ClubModel, challenge: ChallengeModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
       this.challengesRef.child(club.getClubKey())
       .push(challenge.toJson()).then((snapshot) => {
         let updateCommand = {};
         // Update the challenger relashionships.
         // The challenger.
         updateCommand[DB_ROOT_CLUB_CHALLENGER + club.getClubKey() + '/'
         + challenge.userChallenger.getUid() + '/'
         + snapshot.key] = true;
         // Update the opponent.
         updateCommand[DB_ROOT_CLUB_CHALLENGED + club.getClubKey() + '/'
         + challenge.userChallenged.getUid() + '/'
         + snapshot.key] = true;

         firebase.database().ref().update(updateCommand).then((_) => {
          resolve(true);
         });
        }, (err) => {reject(err);});
    });
  }

  acceptUserChallenge(challenge: ChallengeModel, club: ClubModel): Promise<any> {
    return new Promise((resolve,reject) => {
      let commands = {};
      commands[DB_ROOT_CHALLENGES + club.getClubKey() 
        + '/' + challenge.dbKey + '/' + 'status'] = ChallengeStatus.ACCEPTED;
      
      commands[DB_ROOT_EVENT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey] = true;

      firebase.database().ref('/').update(commands).then((snapshot) => {
        resolve(true)
      }, (err) => {
        reject(err);
      });
    });
  }

  excludeChallenge(challenge: ChallengeModel, club: ClubModel): Promise<boolean> {
    return new Promise((resolve,reject) => {
      let commands = {};
      // Remove the challenger
      commands[DB_ROOT_CLUB_CHALLENGER + club.getClubKey() 
      +'/'+ challenge.userChallenger.getUid() +'/'+ challenge.dbKey] = null;

      // Remove the challenged
      commands[DB_ROOT_CLUB_CHALLENGED + club.getClubKey() 
      +'/'+ challenge.userChallenged.getUid() +'/'+ challenge.dbKey] = null;

      // Remove the event if it is confirmed.
      commands[DB_ROOT_EVENT_CHALLENGES + club.getClubKey() 
      +'/'+ challenge.dbKey] = null;

      commands[DB_ROOT_CHALLENGES + club.getClubKey() 
      +'/'+ challenge.dbKey] = null;

      firebase.database().ref('/').update(commands)
      .then((_) => {
        resolve(true);
      }, (err) => {
        reject(err);
      });
    });
  }

  launchChallengeResult(club: ClubModel, challenge: ChallengeModel, 
    isAdmin: boolean): Promise<boolean> {
    return new Promise((resolve,reject) => {
      let commands = {};
      if (isAdmin) {
        commands[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/status'] = ChallengeStatus.COMPLETED;
      } else {
        commands[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/status'] = ChallengeStatus.ACCOMPLISHED;
      }
      commands[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/challengerWins'] = challenge.challengerWins;
      commands[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/challengedWins'] = challenge.challengedWins;
      if (challenge.isResultByChallenger) {
        commands[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/isResultByChallenger'] = true;
      }

      // Remove event challenge.
      commands[DB_ROOT_EVENT_CHALLENGES + club.getClubKey() 
      + '/' + challenge.dbKey] = null;

      firebase.database().ref('/').update(commands)
      .then((_) => {
        resolve(true);
      }, (err) => {reject(err);});
    });
  }

  confirmAccomplishedChallenge(challenge: ChallengeModel, club: ClubModel, isAdmin: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let command = {}
      command[DB_ROOT_CHALLENGES + club.getClubKey()
      + '/' + challenge.dbKey + '/status'] = ChallengeStatus.COMPLETED;
      if (isAdmin) {
        command[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/challengerWins'] = challenge.challengerWins;
        command[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/challengedWins'] = challenge.challengedWins;
        command[DB_ROOT_CHALLENGES_ADMIN_VALIDATION + club.getClubKey()
        + '/' + challenge.dbKey] = null;
      }

      firebase.database().ref('/').update(command)
      .then((_) => {
        resolve(true);
      }, (err) => {reject(err);});
    });
  }

  refuseAccomplishedChallenge(challenge: ChallengeModel, club: ClubModel
    , isAdmin: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (isAdmin) { // Admin can exclude any challenge without require confirmation.
        this.excludeChallenge(challenge, club)
        .then((_) => {
          resolve(true);
        }, (err) => {
          reject(err);
        });
      } else { 
        let command = {}
        command[DB_ROOT_CHALLENGES + club.getClubKey()
        + '/' + challenge.dbKey + '/status'] = ChallengeStatus.ADMIN_VALIDATION;
        
        command[DB_ROOT_CHALLENGES_ADMIN_VALIDATION + club.getClubKey()
        + '/' + challenge.dbKey] = true;

        firebase.database().ref('/').update(command)
        .then((_) => {
          resolve(true);
        }, (err) => {
          reject(err);
        });
      }
    });
  }
  // ------------------------------------------------

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
  getUserProfile(): Promise<UserProfileModel> {
      return new Promise((resolve,reject) => {
        if (this.userProfile !== undefined) {
          resolve(this.userProfile);
        } else {
          this.usersRef.child(firebase.auth().currentUser.uid)
          .once('value', (snapshot) => {
            let user = new UserProfileModel();
            user.setUid(snapshot.key);
            user.displayName = snapshot.val().displayName;
            user.email = snapshot.val().email;
            user.thumbnailUrl = snapshot.val().thumbnailUrl;
            user.creationDate = snapshot.val().creationDate;
            this.userProfile = user;
            resolve(this.userProfile);
          }, (err) => {reject(err)});
        }
    });
  }

  private getUserPendingJoinClubs(uid: string): Promise<Array<string>> {
    return new Promise( (resolve, reject) => {
      firebase.database().ref(DB_ROOT_JOIN_MEMBER_CLUBS).child(uid)
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
      this.memberClubsRef.child(uid)
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

  private getClubMemberKeys(club: ClubModel): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      this.clubMembersRef.child(club.getClubKey()).once('value', (snapshot) => {
        let userKeys = new Array<string>();
        snapshot.forEach(element => {
          let currentUid = firebase.auth().currentUser.uid;
          // Remove current user from list.
          if (new String(currentUid).valueOf() !== new String(element.key).valueOf()) {
            userKeys.push(element.key);
          }
        });
        resolve(userKeys);
      }, (err) => {reject(err)});
    });
  }

  // Get all challenges created by current user.
  private getUserChallengerList(club: ClubModel): Promise<Array<ChallengeModel>> {
    return new Promise((resolve,reject) => {
      // Get the keys first.
      this.clubChallengerRef.child(club.getClubKey())
      .child(firebase.auth().currentUser.uid).once('value', (snapshots) => {
        let commands = new Array<any>();
        // create the commands with the keys.
        snapshots.forEach(snapshot => {
          commands.push(
            this.challengesRef.child(club.getClubKey()).child(snapshot.key).once('value')
          )
        });

        // empty challenges
        if (commands.length === 0) {
          resolve(new Array<ChallengeModel>());
        }

        Promise.all(commands)
        .then((snapshots) => {
          let challenges = new Array<ChallengeModel>();
          snapshots.forEach(snapshot => {
            let challenge = new ChallengeModel();
            challenge.dbKey = snapshot.key;
            challenge.userChallengerId = snapshot.val().challenger;
            challenge.userChallengedId = snapshot.val().challenged;
            challenge.date = snapshot.val().date;
            challenge.local = snapshot.val().local;
            // Set the currect enum val, from string.
            challenge.status = snapshot.val().status;
            challenge.challengerWins = snapshot.val().challengerWins;
            challenge.challengedWins = snapshot.val().challengedWins;
            challenge.isResultByChallenger = snapshot.val().isResultByChallenger;

            challenges.push(challenge);
          });
          resolve(challenges);
        });
      }, (err) => {reject(err)});
    });
  }

  // Get challenges create by other users, that mention current user.
  private getUserChallengedList(club: ClubModel): Promise<Array<ChallengeModel>> {
    return new Promise((resolve,reject) => {
      // Get the keys first.
      this.clubChallengedRef.child(club.getClubKey())
      .child(firebase.auth().currentUser.uid).once('value', (snapshots) => {
        let commands = new Array<any>();
        // create the commands with the keys.
        snapshots.forEach(snapshot => {
          commands.push(
            this.challengesRef.child(club.getClubKey()).child(snapshot.key).once('value')
          )
        });

        // empty challenges
        if (commands.length === 0) {
          resolve(new Array<ChallengeModel>());
        }

        Promise.all(commands)
        .then((snapshots) => {
          let challenges = new Array<ChallengeModel>();
          snapshots.forEach(snapshot => {
            let challenge = new ChallengeModel();
            challenge.dbKey = snapshot.key;
            challenge.userChallengerId = snapshot.val().challenger;
            challenge.userChallengedId = snapshot.val().challenged;
            challenge.date = snapshot.val().date;
            challenge.local = snapshot.val().local;
            // Set the currect enum val, from string.
            challenge.status = snapshot.val().status;
            challenge.challengerWins = snapshot.val().challengerWins;
            challenge.challengedWins = snapshot.val().challengedWins;
            challenge.isResultByChallenger = snapshot.val().isResultByChallenger;
            challenges.push(challenge);
          });
          resolve(challenges);
        });
      }, (err) => {reject(err)});
    });
  }

  // Get challenges that need admin validation.
  private getChallengeAdminValidation(club: ClubModel): Promise<Array<ChallengeModel>> {
    return new Promise((resolve,reject) => {
      // Get the keys first.
      this.challengesAdminValidationRef.child(club.getClubKey())
      .once('value', (snapshots) => {
        let commands = new Array<any>();
        // create the commands with the keys.
        snapshots.forEach(snapshot => {
          commands.push(
            this.challengesRef.child(club.getClubKey()).child(snapshot.key).once('value')
          )
        });

        // empty challenges
        if (commands.length === 0) {
          resolve(new Array<ChallengeModel>());
        }

        Promise.all(commands)
        .then((snapshots) => {
          let challenges = new Array<ChallengeModel>();
          snapshots.forEach(snapshot => {
            let challenge = new ChallengeModel();
            challenge.dbKey = snapshot.key;
            challenge.userChallengerId = snapshot.val().challenger;
            challenge.userChallengedId = snapshot.val().challenged;
            challenge.date = snapshot.val().date;
            challenge.local = snapshot.val().local;
            // Set the currect enum val, from string.
            challenge.status = snapshot.val().status;
            challenge.challengerWins = snapshot.val().challengerWins;
            challenge.challengedWins = snapshot.val().challengedWins;
            challenge.isResultByChallenger = snapshot.val().isResultByChallenger;
            challenges.push(challenge);
          });
          resolve(challenges);
        });
      }, (err) => {reject(err)});
    });
  }

}
