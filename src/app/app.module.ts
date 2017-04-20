import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { FirebaseService } from '../providers/firebase-service';
import { CameraService } from '../providers/camera-service';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireModule } from 'angularfire2';

export const firebaseConfig = {
  apiKey: "AIzaSyAHDEjrqVFI0ko98ShvPVxoTLVYmxLokoo",
  authDomain: "kof-club.firebaseapp.com",
  databaseURL: "https://kof-club.firebaseio.com",
  storageBucket: "kof-club.appspot.com",
  messagingSenderId: "696218730032",
  projectId: "kof-club"
};

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    FirebaseService,
    CameraService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
