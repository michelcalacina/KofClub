
export class ClubModel {

    public title: string;
    public description: string;
    public thumbnailURL: string;
    public creationDate: object;
    public userAdmin: string;

    private _clubKey: string;
    
    constructor() {

    }

    public getClubKey() {
        return this._clubKey;
    }

    public setClubKey(key: string) {
        this._clubKey = key;
    }

    public static toClubModel(jsonLike: any): ClubModel {
        let club = new ClubModel();
        club.title = jsonLike.title;
        club.description = jsonLike.description;
        club.thumbnailURL = jsonLike.thumbnailURL;
        club.creationDate = jsonLike.creationDate;
        club.userAdmin = jsonLike.userAdmin;
        return club;
    }
}