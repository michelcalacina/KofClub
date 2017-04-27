import { UserProfileModel } from '../model/user-profile-model';

export enum ChallengeStatus {
    PENDING,
    ACCEPTED,
    REFUSED,
    ACCOMPLISHED,
    VERIFIED,
    ADMIN_VALIDATION,
    COMPLETED
}
export class ChallengeModel {
    public challenger: UserProfileModel;
    public challeged: UserProfileModel;
    public local: string;
    public date: string;
    public status: ChallengeStatus;

    toJson(): any {
        let jcm = {};
        jcm["challenger"] = this.challenger.getUid().valueOf();
        jcm["challenged"] = this.challeged.getUid().valueOf();
        jcm["local"] = this.local.valueOf();
        jcm["date"] = this.date.valueOf();
        jcm["status"] = ChallengeStatus[this.status];

        return jcm;
    }
}