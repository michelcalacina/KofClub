import { UserProfileModel } from './user-profile-model';

export class ChallengeProfileModel {
    user: UserProfileModel;
    isChallenge: boolean;

    constructor() {
        this.isChallenge = false;
    }
}