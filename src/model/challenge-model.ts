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
    public challenger: string;
    public challenged: string;
    public challengerWins: number;
    public challengedWins: number;
    public local: string;
    public date: string;
    public status: ChallengeStatus;
    public isResultLaunchedByChallenger: boolean;
    public opponent: UserProfileModel;

    constructor() {
        this.isResultLaunchedByChallenger = false;
        this.challengerWins = -1;
        this.challengedWins = -1;
    }

    toJson(): any {
        let jcm = {};
        jcm["challenger"] = this.challenger;
        jcm["challenged"] = this.challenged;
        jcm["local"] = this.local.valueOf();
        jcm["date"] = this.date.valueOf();
        jcm["status"] = this.status;
        jcm["isResultByChallenger"] = this.isResultLaunchedByChallenger;
        jcm["challengerWins"] = this.challengerWins;
        jcm["challengedWins"] = this.challengedWins;

        return jcm;
    }
}