export class UserProfileModel {
    public email: string;
    public thumbnailUrl: string;
    public creationDate: object;
    public displayName: string;

    private _uid: string;
    private clubs: Array<string>;

    constructor() {
        this.clubs = new Array<string>();
    }

    public getUid(): string {
        return this._uid;
    }

    public setUid(uid: string) {
        this._uid = uid;
    }

    public getClubs() {
        return this.clubs;
    }

    public setClubs(clubs: Array<string>) {
        this.clubs = clubs;
    }

    public toJSON() {

        return {"displayName": this.displayName,
                "email": this.email,
                "thumbnailUrl": this.thumbnailUrl,
                "creationDate": this.creationDate};
    }
}