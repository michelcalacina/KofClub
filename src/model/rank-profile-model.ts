export class RankProfileModel {
    public uid;
    public challengeLoses;
    public challengeWins;
    public experience;
    public lvl;
    public matchLoses;
    public matchWins;
    public avatar;
    public displayName;

    constructor() {

    }

    public getTotalChallenges(): number {
        return this.challengeLoses + this.challengeWins;
    }

    public getTotalMatches(): number {
        return this.matchWins + this.matchLoses;
    }

    public getChallengeEfficiency(): number {
        return (this.challengeWins * 100)/this.getTotalChallenges();
    }

    public getMatchEfficiency(): number {
        return (this.matchWins * 100)/this.getTotalMatches();
    }
}