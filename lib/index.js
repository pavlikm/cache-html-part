"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analyze_1 = require("./analyze");
var fs = require('fs');
var crypto = require('crypto');
const const_1 = require("./const");
const apply_1 = require("./apply");
const cookie_1 = require("./cookie");
const pjson = require('../package.json');
let records = [];
function stash(filterFunction = (e) => false, renderedCount = 1) {
    return function (req, res, next) {
        var originalSend = res.send;
        var originalEnd = res.end;
        var originalRender = res.render;
        var routeInitialized = false;
        let script = fs.readFileSync(__dirname + '/../browser/cache-html-part.min.js', 'utf8');
        let scriptUrl = crypto.createHash('sha1').update(script).digest('hex') + "/cache-html-part.min.js";
        if (!routeInitialized) {
            routeInitialized = true;
            res.app.get("/" + scriptUrl, (req, res) => {
                res.set('Cache-control', 'public, max-age=3600');
                var html = fs.readFileSync(__dirname + '/../browser/cache-html-part.min.js', 'utf8');
                res.write(html);
                res.end();
            });
        }
        // @ts-ignore
        res.send = function (chunk) {
            chunk = chunk.toString().replaceAll(const_1.START_TAG, '').replaceAll(const_1.END_TAG, '');
            (0, analyze_1.analyze)(chunk, filterFunction, records);
            chunk = (0, apply_1.apply)(chunk, records, renderedCount);
            if (chunk && chunk.toString() && chunk.toString().indexOf(const_1.START_TAG) > -1 && chunk.toString().indexOf(const_1.END_TAG) > -1 && !req.xhr) {
                let stashed = (0, cookie_1.getCookie)(req, 'static');
                var matchAll = chunk.toString().matchAll(/<!-- static -->([\s\S]*?)<!-- static-end -->/gi);
                const arr = [...matchAll];
                for (var i = 0; i < arr.length; i++) {
                    let withTag = arr[i][0];
                    let withoutTag = arr[i][1];
                    let hash = crypto.createHash('md5').update(withoutTag + pjson.version).digest('hex');
                    let replace = '';
                    if (stashed.indexOf(hash) > -1) {
                        replace = '<static ref="' + hash + '"></static>';
                    }
                    else {
                        replace = "<!-- static " + hash + " -->" + withoutTag + const_1.END_TAG;
                    }
                    if (i === arr.length - 1) {
                        replace += '<script src="/' + scriptUrl + '" type="text/javascript"></script>';
                    }
                    chunk = chunk.toString().replace(withTag, replace);
                }
                arguments[0] = chunk.toString();
                res.setHeader('Content-Length', chunk.length);
            }
            // @ts-ignore
            originalSend.apply(res, arguments);
        };
        // @ts-ignore
        res.render = function (view, options, fn) {
            if (fn === undefined) {
                // @ts-ignore
                originalRender.call(this, view, options, (err, out) => {
                    res.send(out);
                });
            }
            else {
                // @ts-ignore
                originalRender.call(this, view, options, fn);
            }
        };
        next();
    };
}
module.exports = stash;
//# sourceMappingURL=index.js.map