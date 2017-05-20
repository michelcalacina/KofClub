import { UserProfileModel } from '../model/user-profile-model';

export enum ChallengeStatus {
    PENDING,
    ACCEPTED,
    ACCOMPLISHED,
    ADMIN_VALIDATION,
    COMPLETED
}
export class ChallengeModel {
    public dbKey: string;
    public userChallengerId: string;
    public userChallengedId: string;
    public userChallenger: UserProfileModel;
    public userChallenged: UserProfileModel;
    public challengerWins: number;
    public challengedWins: number;
    public local: string;
    public date: string;
    public status: ChallengeStatus;
    public isResultByChallenger: boolean;
    public finishedDate: string;

    constructor() {
        this.isResultByChallenger = false;
        this.challengedWins = 0;
        this.challengerWins = 0;
        this.finishedDate = "0";
    }

    toJson(): any {
        let jcm = {};
        jcm["challenger"] = this.userChallenger.getUid();
        jcm["challenged"] = this.userChallenged.getUid();
        jcm["local"] = this.local.valueOf();
        jcm["date"] = this.date.valueOf();
        jcm["status"] = this.status;
        jcm["isResultByChallenger"] = this.isResultByChallenger;
        jcm["challengerWins"] = this.challengerWins;
        jcm["challengedWins"] = this.challengedWins;
        jcm["finishedDate"] = this.finishedDate;

        return jcm;
    }
}