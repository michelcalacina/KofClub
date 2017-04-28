import { UserProfileModel } from './user-profile-model';

export class ChallengeProfileModel {
    user: UserProfileModel;
    isChallenger: boolean;
    isChallenged: boolean;

    constructor() {
        this.isChallenged = false;
        this.isChallenger = false;
    }
}