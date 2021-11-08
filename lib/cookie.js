"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = void 0;
function getCookie(req, name) {
    function escape(s) {
        return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1');
    }
    if (!req.headers.cookie)
        return [];
    // @ts-ignore
    var match = req.headers.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1].split(",") : [];
}
exports.getCookie = getCookie;
//# sourceMappingURL=cookie.js.map