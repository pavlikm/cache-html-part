import {parse} from "node-html-parser";
import crypto from "crypto";
import {Record} from "./record";
import {END_TAG, START_TAG} from "./const";

const pjson = require('../package.json');

export function analyze(html: string, filterFunction: Function = (element: any) => true, records: Record[]) {
    html = html.replaceAll(START_TAG, '').replaceAll(END_TAG, '');
    const root = parse(html);
    const divs = root.getElementsByTagName('div');
    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];
        if (!filterFunction(div)) continue;
        let hash = crypto.createHash('md5').update(div + pjson.version).digest('hex');
        let found = false;
        for (let j = 0; j < records.length; j++) {
            let r: Record = records[j];
            if (r.hash == hash) {
                r.count++;
                found = true;
                break;
            }
        }
        if (!found) {
            records.push(new Record(hash, div.toString()));
        }
    }
}

