
export class ClubModel {

    public title: string;
    public description: string;
    public thumbnailURL: string;
    public creationDate: object;
    public userAdmin: string;

    private thumbnailBlob: Blob;
    
    constructor() {

    }

    public getThumbnailBlob() {
        return this.getThumbnailBlob;
    }
}