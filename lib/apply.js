"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = void 0;
const const_1 = require("./const");
function apply(html, records, renderedCount) {
    records.sort((a, b) => {
        return a.html.length > b.html.length ? 1 : -1;
    });
    for (let i = 0; i < records.length; i++) {
        if (records[i].count >= renderedCount) {
            html = html.replaceAll(records[i].html, const_1.START_TAG + records[i].html + const_1.END_TAG);
        }
    }
    return html;
}
exports.apply = apply;
//# sourceMappingURL=apply.js.map