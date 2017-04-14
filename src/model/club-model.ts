export class ClubModel {
    public title: string;
    public description: string;
    public thumbnail: string;

    constructor(public titleParam: string
    , public descriptionParam: string
    , public thumbnailParam: string) {

        this.title = titleParam;
        this.description = descriptionParam;
        this.thumbnail = thumbnailParam;
    }
}