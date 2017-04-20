
export class ClubModel {

    public title: string;
    public description: string;
    public thumbnailURL: string;
    public creationDate: object;
    public userAdmin: string;

    private _clubKey: string;
    private _isClubLoggedUser: boolean;
    
    constructor() {
        this._isClubLoggedUser = false;
    }

    getClubKey = function(): string {
        return this._clubKey;
    }

    setClubKey = function(key: string) {
        this._clubKey = key;
    }

    setIsClubLoggedUser = function(status: boolean) {
        this._isClubLoggedUser = status;
    }

    isClubLoggedUser = function(): boolean {
        return this._isClubLoggedUser;
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

    public toJSON() {
        return {"title": this.title,
                "description": this.description,
                "thumbnailURL": this.thumbnailURL,
                "creationDate": this.creationDate,
                "userAdmin": this.userAdmin};
    }
}