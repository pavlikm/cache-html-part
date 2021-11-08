"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = void 0;
const node_html_parser_1 = require("node-html-parser");
const crypto_1 = __importDefault(require("crypto"));
const record_1 = require("./record");
const const_1 = require("./const");
const pjson = require('../package.json');
function analyze(html, filterFunction = (element) => true, records) {
    html = html.replaceAll(const_1.START_TAG, '').replaceAll(const_1.END_TAG, '');
    const root = (0, node_html_parser_1.parse)(html);
    const divs = root.getElementsByTagName('div');
    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];
        if (!filterFunction(div))
            continue;
        let hash = crypto_1.default.createHash('md5').update(div + pjson.version).digest('hex');
        let found = false;
        for (let j = 0; j < records.length; j++) {
            let r = records[j];
            if (r.hash == hash) {
                r.count++;
                found = true;
                break;
            }
        }
        if (!found) {
            records.push(new record_1.Record(hash, div.toString()));
        }
    }
}
exports.analyze = analyze;
//# sourceMappingURL=analyze.js.map