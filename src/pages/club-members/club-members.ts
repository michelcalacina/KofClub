import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController
  , ToastController, ActionSheetController, AlertController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { UserProfileModel } from '../../model/user-profile-model';

@IonicPage()
@Component({
  selector: 'page-club-members',
  templateUrl: 'club-members.html',
})
export class ClubMembers {

  private club: ClubModel;
  private users: Array<UserProfileModel>;
  private attemptActionUser: UserProfileModel;
  private loggedUser: UserProfileModel;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , private firebaseService: FirebaseService, private loadingCtrl: LoadingController
  , private toastCtrl: ToastController, private actionSheetCtrl: ActionSheetController
  , private alertCtrl: AlertController) {
    this.club = navParams.get("club");
    this.loggedUser = navParams.get("loggedUser");

    this.attemptActionUser = null;
    this.users = new Array<UserProfileModel>();
    this.loadMembers();
  }

  loadMembers() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.getClubMembers(this.club)
    .then((users: Array<UserProfileModel>) => {
      this.club.admins.forEach(a => {
        users.forEach(user => {
          if (a.valueOf() === user.getUid().valueOf()) {
            user.isAdmin = true;
            return false;  
          }
        });
      });

      this.users = users;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  checkUser(user: UserProfileModel) {
    if (!this.loggedUser.isAdmin) {
      return;
    }

    // Can not manipulate self profile on this screen.
    if (this.loggedUser.getUid().valueOf() === user.getUid().valueOf()) {
      this.showToast("Desculpe, não pode alterar nem excluir seu usuário!");
      return;
    }

    user.isChecked = !user.isChecked;

    if (user.isChecked) {
      if (this.attemptActionUser !== null) {
        this.attemptActionUser.isChecked = false;
      }
      user.isChecked = true;
      this.attemptActionUser = user;

      if (!this.attemptActionUser.isAdmin) {
        this.actionSheetMakeAdminExclude(user);
      } else {
        this.actionSheetRemoveAdminExclude(user);
      }
    } else {
      this.attemptActionUser = null; 
    }
  }

  giveAdminPower() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.giveAdminRole(this.attemptActionUser, this.club).then(() => {
      this.attemptActionUser.isAdmin = true;
      this.attemptActionUser.isChecked = false;
      this.club.admins.push(this.attemptActionUser.getUid());
      this.attemptActionUser = null;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  removeAdminRole() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.removeAdminRole(this.attemptActionUser, this.club).then(() => {
      this.attemptActionUser.isAdmin = false;
      this.attemptActionUser.isChecked = false;
      let i = this.club.admins.indexOf(this.attemptActionUser.getUid());
      this.club.admins.splice(i, 1);
      this.attemptActionUser = null;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  excludeMember() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.excludeMemberFromClub(this.attemptActionUser, this.club).then(() => {
      let iu = this.users.indexOf(this.attemptActionUser);
      if (iu > -1) {
        this.users.splice(iu, 1);
      }
      let i = this.club.admins.indexOf(this.attemptActionUser.getUid());
      if (i > -1) {
        this.club.admins.splice(i, 1);
      }
      this.club.qntdMembers--;
      this.attemptActionUser = null;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      dismissOnPageChange: true,
      duration: 3000,
      message: message,
    });
    toast.present();
  }

  private actionSheetMakeAdminExclude(user: UserProfileModel) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Alterar/Excluir',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'EXCLUIR',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.showAlertConfirmation(user);
          }
        },{
          text: 'TORNAR ADMINISTRADOR',
          icon: 'ionitron',
          handler: () => {
            this.giveAdminPower();
          }
        },{
          text: 'CANCELAR',
          role: 'cancel',
          icon: 'arrow-back',
          handler: () => {
            this.checkUser(user);
          }
        }
      ]
    });
    actionSheet.present();
  }

  actionSheetRemoveAdminExclude(user: UserProfileModel) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Alterar/Excluir',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'EXCLUIR',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.showAlertConfirmation(user);
          }
        },{
          text: 'REMOVER PRIVILÉGIO',
          role: 'Destructive',
          icon: 'remove-circle',
          handler: () => {
            this.removeAdminRole();
          }
        },{
          text: 'CANCELAR',
          role: 'cancel',
          icon: 'arrow-back',
          handler: () => {
            this.checkUser(user);
          }
        }
      ]
    });
    actionSheet.present();
  }

  showAlertConfirmation(user: UserProfileModel) {
    let confirm = this.alertCtrl.create({
      title: 'Remover membro?',
      message: 'Ao confirmar, todos os dados serão removidos do grupo como desafios, rank e perfil, não pode ser desfeito!',
      buttons: [
        {
          text: 'Voltar',
          handler: () => {
            this.checkUser(user);
          }
        },
        {
          text: 'Excluir',
          handler: () => {
            this.excludeMember();
          }
        }
      ]
    });
    confirm.present();
  }

}
