export class Record {
    count: number = 1;
    hash: string = '';
    html: string = '';

    constructor(hash: string, html: string) {
        this.hash = hash;
        this.html = html;
    }
}