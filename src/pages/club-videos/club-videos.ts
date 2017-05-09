import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController} from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';

import { FirebaseService } from '../../providers/firebase-service';
import { ClubModel } from '../../model/club-model';
import { VideoModel } from '../../model/video-model';

@IonicPage()
@Component({
  selector: 'page-club-videos',
  templateUrl: 'club-videos.html',
})

export class ClubVideos {

  private club: ClubModel;
  public isAdmin: boolean;
  videos: Array<VideoModel>;
  private baseURL = "https://www.youtube.com/embed/";

  constructor(private navCtrl: NavController, private navParams: NavParams
  , private loadingCtrl: LoadingController, private firebaseService: FirebaseService
  , private domSanitizer: DomSanitizer, private screenOrientation: ScreenOrientation
  , private alertCtrl: AlertController) {
    
    this.videos = new Array<VideoModel>();
    this.club = navParams.get("club");
    this.isAdmin = navParams.get("isAdmin");
    this.loadVideos();
    this.screenOrientation.unlock();
  }

  loadVideos() {
    let loading = this.loadingCtrl.create({dismissOnPageChange: true});
    loading.present();

    this.firebaseService.loadClubVideos(this.club)
    .then(videos => {
      videos.forEach(video => {
        video.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.baseURL + video.videoId);
      });
      this.videos = videos;
      loading.dismiss();
    }, (err) => {
      console.log(err);
      loading.dismiss();
    });
  }

  ionViewWillLeave() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  addVideo() {
    let alert = this.alertCtrl.create({
      title: 'ID do vídeo no Youtube',
      inputs: [
        {
          name: 'id',
          placeholder: 'exemplo: vUsly6gXbPQ'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Salvar',
          handler: data => {
            let loading = this.loadingCtrl.create({dismissOnPageChange: true});
            loading.present();
            
            if (data.id != undefined && data.id.trim().length > 0) {
              let video = new VideoModel();
              video.videoId = data.id;
              this.firebaseService.CreateClubVideo(this.club, video)
              .then(v => {
                v.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.baseURL + v.videoId);
                this.videos.push(v);
                loading.dismiss();
              }, (err) => {
                console.log(err);
                loading.dismiss();
              });
            }
          }
        }
      ]
    });
    alert.present();
  }

}
