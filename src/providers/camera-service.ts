import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Injectable()
export class CameraService {

  constructor(public camera: Camera) {
    
  }

  // Return a promisse with the image data or error.
  getPicture(isFromCamera: boolean): any {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 420,
      targetHeight: 280
    }

    if (isFromCamera) {
      options.sourceType = this.camera.PictureSourceType.CAMERA;
      //this.camera.cleanup();
    } else {
      options.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
    }

    return new Promise((success, reject) => {
        this.camera.getPicture(options).then((imageData)=>{
          /** Return the raw data image on base64.
               I have experienced so much issues with URI format,
               Because window.resolveLocalFileSystemURL is not properly working.
          **/
          success(imageData);
        }, (err) => {
          reject(err);
        });
    });  
  }

}
