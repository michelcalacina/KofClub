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
      title: 'YouTube',
      inputs: [
        {
          name: 'contentUrl',
          placeholder: 'URL ou ID do Vídeo.'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
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
            
            if (data.contentUrl != undefined && data.contentUrl.trim().length > 0) {
              let video = new VideoModel();
              let i = data.contentUrl.indexOf("?v=");
              if (i > -1) {
                video.videoId = (<string>data.contentUrl).substr(i+3, data.contentUrl.length-1);
              } else {
                video.videoId = data.contentUrl;
              }
              
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

  removeVideo(video: VideoModel) {
    let alert = this.alertCtrl.create({
      title: 'Deseja excluir esse vídeo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Excluir',
          handler: data => {
            let loading = this.loadingCtrl.create({dismissOnPageChange: true});
            loading.present();
            
            this.firebaseService.removeVideo(this.club, video)
            .then(v => {
              let index = this.videos.indexOf(video);
              if (index > -1) {
                this.videos.splice(index,1);
              }
              
              loading.dismiss();
            }, (err) => {
              console.log(err);
              loading.dismiss();
            });
          }
        }
      ]
    });
    alert.present();
  }
}
