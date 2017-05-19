import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import firebase from 'firebase';

import { ClubModel } from '../model/club-model';
import { UserProfileModel } from '../model/user-profile-model';
import { ChallengeModel, ChallengeStatus } from '../model/challenge-model';
import { RankProfileModel } from '../model/rank-profile-model';
import { VideoModel } from '../model/video-model';

const DB_ROOT_CLUBS = "/clubs/";
const DB_ROOT_USERS = "/users/";
const DB_ROOT_CLUBS_RANK = "/clubs-rank/";
const DB_ROOT_CLUB_MEMBERS = "/club-members/";
const DB_ROOT_MEMBER_CLUBS = "/member-clubs/";
// List all pending users by club, useful for admin.
const DB_ROOT_JOIN_CLUB_MEMBERS = "/join-club-members/";
const DB_ROOT_CHALLENGES = "/challenges/";
// Store from challenger to challenged. Get that who, I do wish to challenge.
const DB_ROOT_CLUB_CHALLENGER = "/club-challenger/";
// Store from challenged to challenger. Get that who, wish do challenge me.
const DB_ROOT_CLUB_CHALLENGED = "/club-challenged/";
const DB_ROOT_CHALLENGES_ADMIN_VALIDATION = "/challenges-admin-validation/";
const DB_ROOT_EVENT_CHALLENGES = "/event-challenges/";
const DB_ROOT_CLUB_VIDEOS = "/club-videos/";

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
  private clubsRankRef: any;
  private clubVideosRef: any;
  private joinClubMembers: any;

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
    this.clubsRankRef = firebase.database().ref(DB_ROOT_CLUBS_RANK);
    this.clubVideosRef = firebase.database().ref(DB_ROOT_CLUB_VIDEOS);
    this.joinClubMembers = firebase.database().ref(DB_ROOT_JOIN_CLUB_MEMBERS);
  }

  // Login control.
  login(email: string, password: string): Promise<boolean> {
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

  changePassword(email: string, currentPassword: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve,reject) => {
      this.login(email, currentPassword)
      .then(result => {
        if (result) {
          this.fireAuth.currentUser.updatePassword(newPassword)
          .then(() => {
            resolve(true);
          },(err) => reject(err));
        } else {
          reject(result);
        }
      });
    });
  }

  changeEmail(newEmail: string): Promise<boolean> {
    return new Promise((resolve,reject) => {
      this.fireAuth.currentUser.updateEmail(newEmail)
      .then(() => {
        resolve(true);
      }, (err) => {reject(err)});
    });
  }

  logout(): any {
    return this.fireAuth.signOut();
  }

  updateUserProfile(newName: string, newEmail: string, newAvatarUrl: string
    , profile: UserProfileModel, userPassword: string): Promise<any> {
    return new Promise((resolve,reject) => {
      this.login(profile.email, userPassword).then(() => {
        let objectUpdate = {};
        if (newName) {
          objectUpdate["displayName"] = newName;
        }

        if (newAvatarUrl) {
          objectUpdate["thumbnailUrl"] = newAvatarUrl;
        }

        if (newEmail) {
          objectUpdate["email"] = newEmail;
          this.changeEmail(newEmail).then(() => {
            this.usersRef.child(profile.getUid()).update(objectUpdate).then(() => {
              this.userProfile.email = newEmail;
              if (newName) {
                this.userProfile.displayName = newName;
              }
              if (newAvatarUrl) {
                this.userProfile.thumbnailUrl = newAvatarUrl;
              }
              resolve(true);
            });
          }, (err) => {reject(err);});
        } else {
          this.usersRef.child(profile.getUid()).update(objectUpdate).then(() => {
            if (newName) {
              this.userProfile.displayName = newName;
            }
            if (newAvatarUrl) {
              this.userProfile.thumbnailUrl = newAvatarUrl;
            }
            resolve(true);
          }, (err) => {reject(err);});
        }
      }, (err) => {reject(err);});
    });
  }

  giveAdminRole(user: UserProfileModel, club: ClubModel): Promise<boolean> {
    return new Promise((resolve,reject) => {
      let commandUpdate = {};
      commandUpdate[user.getUid()] = true;
      this.clubsRef.child(club.getClubKey()).child('admins')
      .update(commandUpdate).then(() => {
        resolve(true);
      }, (err) => {reject(err);});
    });
  }

  removeAdminRole(user: UserProfileModel, club: ClubModel): Promise<boolean> {
    return new Promise((resolve,reject) => {
      let commandUpdate = {};
      commandUpdate[user.getUid()] = null;
      this.clubsRef.child(club.getClubKey()).child('admins')
      .update(commandUpdate).then(() => {
        resolve(true);
      }, (err) => {reject(err);});
    });
  }

  excludeMemberFromClub(user: UserProfileModel, club: ClubModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Remove all references from excluded user.
      let command = {}
      command[DB_ROOT_CLUBS+club.getClubKey()+'/admins/'+user.getUid()] = null;
      command[DB_ROOT_CLUB_MEMBERS+club.getClubKey()+'/'+user.getUid()] = null;
      command[DB_ROOT_CLUBS_RANK+club.getClubKey()+'/'+user.getUid()] = null;
      command[DB_ROOT_MEMBER_CLUBS+user.getUid()+'/'+club.getClubKey()] = null;
      command[DB_ROOT_CLUB_CHALLENGER+club.getClubKey()+'/'+user.getUid()] = null;
      command[DB_ROOT_CLUB_CHALLENGED+club.getClubKey()+'/'+user.getUid()] = null;
      command[DB_ROOT_CLUBS+club.getClubKey()+'/qntdMembers'] = club.qntdMembers-1;

      Promise.all([
        this.getUserChallengerList(club, user.getUid()),
        this.getUserChallengedList(club, user.getUid())
      ]).then(values => {
        values[0].forEach(element => {
          command[DB_ROOT_CHALLENGES+club.getClubKey()+'/'+element.dbKey] = null;
          command[DB_ROOT_CLUB_CHALLENGED+club.getClubKey()+'/'+element.userChallengedId+'/'+element.dbKey] = null;
          command[DB_ROOT_EVENT_CHALLENGES+club.getClubKey()+'/'+element.dbKey] = null;
        });

        values[1].forEach(element => {
          command[DB_ROOT_CHALLENGES+club.getClubKey()+'/'+element.dbKey] = null;
          command[DB_ROOT_CLUB_CHALLENGER+club.getClubKey()+'/'+element.userChallengerId+'/'+element.dbKey] = null;
          command[DB_ROOT_EVENT_CHALLENGES+club.getClubKey()+'/'+element.dbKey] = null;
        });
        
        // Bye bye user, thank you for funny! 
        firebase.database().ref().update(command).then(() => {
          resolve(true);
        }, (err) => {reject(err);});
      });
    });
  }
  //-------------------------------------------

  // Club Control
  createClub(clubName: string, clubDescription: string, maxMembers: number
  , dataBase64: any): any {
    let fileName = clubName.trim() + ".png";
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
          club.maxMembers = maxMembers;
          club.logoName = fileName;
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
                          matchWins: 0, 
                          matchLoses: 0,
                          challengeWins: 0, 
                          challengeLoses: 0,
                          experience: 0,
                          lvl: 0
                         };
          firebase.database().ref().update(updates).then( () => {
            resolve(true);
          }).catch( err => {reject(err)});
      })
    });
  }

  /**
   * Update Club
   */
  updateClub(newTitle: string, newDescription: string, newMaxMembers: number,
    newLogoBase64: any, club: ClubModel): Promise<any> {
    return new Promise((resolve,reject) => {

      let currentFileName = club.title.trim() + '.png';
      // Update club.
      let objUpdate = {};

      if (newTitle !== null) {
        objUpdate["title"] = newTitle;
      }

      if (newDescription !== null) {
        objUpdate["description"] = newDescription;
      }

      if (newMaxMembers > 0) {
        objUpdate["maxMembers"] = newMaxMembers;
      }

      // Update File
      if (newLogoBase64 !== null) {
        // Delete old logo.
        let currentLogoRef = firebase.storage().ref(ST_PATH_LOGOS + club.logoName);
        currentLogoRef.delete().then(() => {
          let fileName = null;
          if (newTitle !== null) {
            fileName = newTitle.trim() + '.png';
          } else {
            fileName = currentFileName;
          }
          this.uploadBlob(newLogoBase64, fileName, ST_PATH_LOGOS).then((newUrlFile) => {
            objUpdate["thumbnailURL"] = newUrlFile;
            objUpdate["logoName"] = fileName;
            club.thumbnailURL = newUrlFile;
            this.clubsRef.child(club.getClubKey()).update(objUpdate).then(() => {
              resolve({"newURL": newUrlFile, "newLogoName": fileName});
            });
          }, (err) => {reject(err);});
        });
      } else {
        this.clubsRef.child(club.getClubKey()).update(objUpdate).then(() => {
           resolve({});
        }, (err) => {reject(err);});
      }

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
   * Status result: 1 - OK; 2 - Club full; 3 - club not exists; 4 - user already belong.
   *                5 - already have a pending request.
   */
  requestAccessToClub(clubKey: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let uid = firebase.auth().currentUser.uid;
      let commands = [];
      commands[0] = this.clubsRef.child(clubKey).once('value');
      commands[1] = this.memberClubsRef.child(uid).child(clubKey).once('value');
      commands[2] = this.joinClubMembers.child(clubKey).child(uid).once('value');

      Promise.all(commands).then(results => {
        let snapClub = results[0];
        let snapHasClub = results[1];
        let snapJoinClubMembers = results[2];

        // Club does not exist.
        if (snapClub.val() === null) {
          resolve(3);
          return;
        }

        // User already belong to this club.
        if (snapHasClub.val() !== null) {
          resolve(4);
          return;
        }

        // Already have a pending request.
        if (snapJoinClubMembers.val() !== null) {
          resolve(5)
          return;
        }

        //let club = ClubModel.toClubModel(snapClub.val());
        // Max quantity members reached.
        if (snapClub.val().maxMembers === snapClub.val().qntdMembers) {
          resolve(2);
          return;
        }

        // All right, can request access.
        let update = {};
        update[DB_ROOT_JOIN_CLUB_MEMBERS + clubKey + '/' + uid] = true;
        firebase.database().ref('/').update(update)
        .then( _ => {
          resolve(1);
        });

      }, (err) => {reject(err)});
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
      // Can not proceed, exceed the max allowed number of members.
      if ((club.qntdMembers + users.length) > club.maxMembers) {
        resolve(false);
        return;
      }
        
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

        // Update
        commands[
          DB_ROOT_CLUBS 
          + club.getClubKey()
          + '/qntdMembers'] = club.qntdMembers + users.length;

        // Remove
        commands[
          DB_ROOT_JOIN_CLUB_MEMBERS
          + club.getClubKey()
          + "/" + user.getUid()] = null;

          // Add to rank
          commands[DB_ROOT_CLUBS_RANK + club.getClubKey() 
          + '/' + user.getUid()] = {
                          matchWins: 0, 
                          matchLoses: 0,
                          challengeWins: 0, 
                          challengeLoses: 0, 
                          experience: 0,
                          lvl: 0
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
      });

      firebase.database().ref().update(commands)
      .then( (_) => {
        resolve(true);
      }).catch((err) => {reject(err)});
    });
  }

  getClubMembers(club: ClubModel): Promise<Array<UserProfileModel>> {
    return new Promise((resolve,reject) => {
      this.getClubMemberKeys(club).then((userKeys: Array<string>) => {
        let commands = userKeys.map((k, v) => {
          return this.usersRef.child(k).once('value');
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
        this.getClubMembers(club),
        this.getUserProfile()
      ]).then(data => {
        let myChallenges = data[0];
        let otherChallenges = data[1];
        let members = data[2];
        let loggedUser = data[3];
        
        // Logged user has created this challenges, configure the opponents.
        myChallenges.forEach( mc => {
          mc.userChallenger = loggedUser;
          members.forEach(o => {
            if (mc.userChallengedId.valueOf() === o.getUid().valueOf()) {
              mc.userChallenged = o;
            }
          });
        });

        // Other users has created this challenges, they challenges me.
        otherChallenges.forEach( oc => {
          oc.userChallenged = loggedUser;
          members.forEach(o => {
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
                members.forEach(o => {
                  if (cv.userChallengerId.valueOf() === o.getUid().valueOf()) {
                    cv.userChallenger = o;
                  }
                });
              }

              // Search for challenged
              if (cv.userChallengedId.valueOf() === loggedUser.getUid().valueOf()) {
                cv.userChallenged = loggedUser;
              } else {
                members.forEach(o => {
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

  // Club Events Control
  loadClubEvents(club: ClubModel): Promise<Array<Array<any>>> {
    return new Promise((resolve,reject) => {
      Promise.all([
        this.loadClubConfirmedEvents(club),
        this.getClubMembers(club)
      ])
      .then(data => {
        let resultData = new Array<Array<any>>();
        // Iterate over confirmed challenges.
        data[0].forEach( challenge => {
          // Iterate over possible opponents.
          data[1].forEach(member => {
            if (challenge.userChallengerId.valueOf() === member.getUid().valueOf()) {
              challenge.userChallenger = member;
            } else if (challenge.userChallengedId.valueOf() === member.getUid().valueOf()) {
              challenge.userChallenged = member;
            }
          });
        });
        // There will be another kind of events ok! for now only challenges.
        resultData.push(data[0]);
        resolve(resultData);
      }, (err) => {reject(err);});
    });
  } 

  // -------------------------------------------------

  // Rank Control
  loadClubRank(club: ClubModel): Promise<Array<RankProfileModel>> {
    return new Promise((resolve,reject) => {
      Promise.all([
        this.loadClubRankInfo(club),
        this.getClubMembers(club)
      ])
      .then(data => {
        data[0].forEach( rankProfile => {
          // Iterate over possible opponents.
          data[1].forEach(member => {
            if (rankProfile.uid.valueOf() === member.getUid().valueOf()) {
              rankProfile.displayName = member.displayName;
              rankProfile.avatar = member.thumbnailUrl;
              return false;
            }
          });
        });
        // Sort from high to low
        let sortedRankProfile = data[0].sort((item2, item1) => {
          if (item1.lvl > item2.lvl) {
            return 1;
          } else if (item2.lvl > item1.lvl) {
            return -1;
          } else if (item1.experience > item2.experience) {
            return 1;
          } else if (item2.experience > item1.experience) {
            return -1;
          } else if (item1.getChallengeEfficiency() > item2.getChallengeEfficiency()) {
            return 1;
          } else if (item2.getChallengeEfficiency() > item1.getChallengeEfficiency()) {
            return -1;
          }

          return 0;
        });
        
        resolve(sortedRankProfile);
      }, (err) => {reject(err);});
    });
  }

  // -------------------------------------------------

  // Videos Control
  loadClubVideos(club: ClubModel): Promise<Array<VideoModel>> {
    return new Promise((resolve,reject) => {
      this.clubVideosRef.child(club.getClubKey()).once('value')
      .then(snapshots => {
        let videos = new Array<VideoModel>();
        snapshots.forEach(snapshot => {
          let video = new VideoModel();
          video.key = snapshot.key;
          video.videoId = snapshot.val().videoId;
          videos.push(video);
        });
        resolve(videos);
      }, err => reject(err));
    });
  }

  CreateClubVideo(club: ClubModel, video: VideoModel): Promise<VideoModel> {
    return new Promise((resolve, reject) => {
      this.clubVideosRef.child(club.getClubKey())
      .push({videoId: video.videoId})
      .then(snapshot => {
        video.key = snapshot.key;
        resolve(video);
      }, (err) => {reject(err)});
    });
  }

  removeVideo(club: ClubModel, video: VideoModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.clubVideosRef.child(club.getClubKey()).child(video.key).remove()
      .then(snapshot => {
        resolve(true);
      }, (err) => {reject(err);});
    });
  }
  // -------------------------------------------------

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
          // if (new String(currentUid).valueOf() !== new String(element.key).valueOf()) {
          userKeys.push(element.key);
          // }
        });
        resolve(userKeys);
      }, (err) => {reject(err)});
    });
  }

  // Get all challenges created by current user.
  private getUserChallengerList(club: ClubModel, uid = firebase.auth().currentUser.uid): Promise<Array<ChallengeModel>> {
    return new Promise((resolve,reject) => {
      // Get the keys first.
      this.clubChallengerRef.child(club.getClubKey())
      .child(uid).once('value', (snapshots) => {
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
  private getUserChallengedList(club: ClubModel, uid = firebase.auth().currentUser.uid): Promise<Array<ChallengeModel>> {
    return new Promise((resolve,reject) => {
      // Get the keys first.
      this.clubChallengedRef.child(club.getClubKey())
      .child(uid).once('value', (snapshots) => {
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

  private loadClubConfirmedEvents(club: ClubModel): Promise<Array<ChallengeModel>> {
    return new Promise((resolve,reject) => {
      this.eventChallengesRef.child(club.getClubKey()).once('value')
      .then(snapshots => {
        let commands = [];
        snapshots.forEach(snapshot => {
          let command = this.challengesRef.child(club.getClubKey())
          .child(snapshot.key).once('value');
          commands.push(command);
        });

        Promise.all(commands).then(snapChallenges => {
          let challenges = new Array<ChallengeModel>();
          snapChallenges.forEach(snapChallenge => {
            let challenge = new ChallengeModel();
            challenge.local = snapChallenge.val().local;
            challenge.date = snapChallenge.val().date;
            challenge.userChallengerId = snapChallenge.val().challenger;
            challenge.userChallengedId = snapChallenge.val().challenged;
            challenges.push(challenge);
          });
          resolve(challenges);
        }, (err) => {reject(err);});
      });
    });
  }

  loadClubRankInfo(club: ClubModel): Promise<Array<RankProfileModel>> {
    return new Promise((resolve,reject) => {
      this.clubsRankRef.child(club.getClubKey()).once('value')
      .then(snapshots => {
        let rankProfiles = new Array<RankProfileModel>();
        snapshots.forEach(snapshot => {
          let rankProfile = new RankProfileModel();
          rankProfile.uid = snapshot.key;
          rankProfile.challengeLoses = snapshot.val().challengeLoses;
          rankProfile.challengeWins = snapshot.val().challengeWins;
          rankProfile.experience = snapshot.val().experience;
          rankProfile.lvl = snapshot.val().lvl;
          rankProfile.matchLoses = snapshot.val().matchLoses;
          rankProfile.matchWins = snapshot.val().matchWins;
          rankProfiles.push(rankProfile);
        });
        resolve(rankProfiles);
      }, (err) => {reject(err);});
    });
  }

}
