import { UserProfileModel } from '../model/user-profile-model';

export enum ChallengeStatus {
    PENDING,
    ACCEPTED,
    REFUSED,
    ACCOMPLISHED,
    ADMIN_VALIDATION,
    COMPLETED
}
export class ChallengeModel {
    public dbKey: string;
    public challenger: string;
    public challenged: string;
    public local: string;
    public date: string;
    public status: ChallengeStatus;
    public opponent: UserProfileModel;

    toJson(): any {
        let jcm = {};
        jcm["challenger"] = this.challenger;
        jcm["challenged"] = this.challenged;
        jcm["local"] = this.local.valueOf();
        jcm["date"] = this.date.valueOf();
        jcm["status"] = this.status;

        return jcm;
    }
}