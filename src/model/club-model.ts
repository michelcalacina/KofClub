export enum CLUB_USER_STATUS {
    MEMBER,
    NOT_MEMBER,
    PENDING
}

export class ClubModel {

    public title: string;
    public description: string;
    public thumbnailURL: string;
    public creationDate: object;
    public admins: Array<string>;
    public maxMembers: number;
    public qntdMembers: number;
    public logoName: string;

    private _clubKey: string;
    private clubUserStatus: CLUB_USER_STATUS;
    

    constructor() {
        this.clubUserStatus = CLUB_USER_STATUS.NOT_MEMBER;
        this.admins = new Array<string>();
        // There is always at least one admin.
        this.qntdMembers = 1;
    }

    getClubKey = function(): string {
        return this._clubKey;
    }

    setClubKey = function(key: string) {
        this._clubKey = key;
    }

    setClubUserStatus(status: CLUB_USER_STATUS) {
        this.clubUserStatus = status;
    }

    getClubUserStatus(): CLUB_USER_STATUS {
        return this.clubUserStatus;
    }

    public static toClubModel(jsonLike: any): ClubModel {
        let club = new ClubModel();
        club.title = jsonLike.title;
        club.description = jsonLike.description;
        club.thumbnailURL = jsonLike.thumbnailURL;
        club.creationDate = jsonLike.creationDate;
        club.maxMembers = jsonLike.maxMembers;
        club.qntdMembers = jsonLike.qntdMembers;
        club.logoName = jsonLike.logoName;
        let admins = jsonLike.admins;
        for(let ua in admins) {
            club.admins.push(ua);
        }
        return club;
    }

    public toJSON() {
        let jua = {};
        for (let ua of this.admins) {
            jua[ua] = true;
        }

        return {"title": this.title,
                "description": this.description,
                "thumbnailURL": this.thumbnailURL,
                "creationDate": this.creationDate,
                "maxMembers": this.maxMembers,
                "qntdMembers": this.qntdMembers,
                "logoName": this.logoName,
                "admins": jua};
    }
}