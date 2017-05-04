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
    //public opponent: UserProfileModel;

    constructor() {
        this.isResultByChallenger = false;
        this.challengerWins = -1;
        this.challengedWins = -1;
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

        return jcm;
    }
}