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
}