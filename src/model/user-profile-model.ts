export class UserProfileModel {
    public email: string;
    public thumbnailUrl: string;
    public creationDate: object;
    public displayName: string;
    public clubs: Array<object>;

    private _uid: string;

    constructor() {
        this.clubs = new Array<object>();
    }

    public getUid(): string {
        return this._uid;
    }

    public setUid(uid: string) {
        this._uid = uid;
    }

    public toJSON() {
        let jup = {};
        for (let ua in this.clubs) {
            jup[ua] = true;
        }

        return {"displayName": this.displayName,
                "email": this.email,
                "thumbnailUrl": this.thumbnailUrl,
                "creationDate": this.creationDate,
                "clubs": jup};
    }
}