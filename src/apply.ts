import {Record} from "./record";
import {END_TAG, START_TAG} from "./const";

export function apply(html: string, records: Record[], renderedCount: number): string {
    records.sort((a: Record,b: Record) => {
        return a.html.length > b.html.length ? 1 : -1;
    })
    for (let i = 0; i < records.length; i++) {
        if (records[i].count >= renderedCount) {
            html = html.replaceAll(records[i].html, START_TAG + records[i].html + END_TAG);
        }
    }
    return html;
}