import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import firebase from 'firebase';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'Home';

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar
    , public splashScreen: SplashScreen) {
    //Initialize Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyAHDEjrqVFI0ko98ShvPVxoTLVYmxLokoo",
      authDomain: "kof-club.firebaseapp.com",
      databaseURL: "https://kof-club.firebaseio.com",
      projectId: "kof-club",
      storageBucket: "kof-club.appspot.com",
      messagingSenderId: "696218730032"
    });

    this.pages = [
      { title: 'Meus Clãs', component: 'UserClubs' },
      { title: 'Integrar Clã', component: 'ClubRequestAccess' },
      { title: 'Perfil', component: 'UserProfile' }
    ];

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.push(page.component);
  }
}
