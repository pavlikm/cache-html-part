import {analyze} from "./analyze";

var fs = require('fs');
var crypto = require('crypto');
import express = require('express');
import {Record} from "./record";
import {END_TAG, START_TAG} from "./const";
import {apply} from "./apply";
import {getCookie} from "./cookie";

const pjson = require('../package.json');

let records: Record[] = [];


function stash(filterFunction: Function = (e: HTMLElement) => false, renderedCount: number = 1) {
    return function (req: express.Request, res: express.Response, next: any) {
        var originalSend = res.send;
        var originalEnd = res.end;
        var originalRender = res.render;
        var routeInitialized = false;

        let script = fs.readFileSync(__dirname + '/../browser/cache-html-part.min.js', 'utf8');
        let scriptUrl = crypto.createHash('sha1').update(script).digest('hex') + "/cache-html-part.min.js";
        if (!routeInitialized) {
            routeInitialized = true;
            res.app.get("/" + scriptUrl, (req: express.Request, res: express.Response) => {
                res.set('Cache-control', 'public, max-age=3600');
                var html = fs.readFileSync(__dirname + '/../browser/cache-html-part.min.js', 'utf8');
                res.write(html);
                res.end();
            })
        }

        // @ts-ignore
        res.send = function (chunk: string) {

            chunk = chunk.toString().replaceAll(START_TAG, '').replaceAll(END_TAG, '');
            analyze(chunk, filterFunction, records);
            chunk = apply(chunk, records, renderedCount);

            if (chunk && chunk.toString() && chunk.toString().indexOf(START_TAG) > -1 && chunk.toString().indexOf(END_TAG) > -1 && !req.xhr) {

                let stashed = getCookie(req, 'static');
                var matchAll = chunk.toString().matchAll(/<!-- static -->([\s\S]*?)<!-- static-end -->/gi);
                const arr = [...matchAll];
                for (var i = 0; i < arr.length; i++) {
                    let withTag = arr[i][0];
                    let withoutTag = arr[i][1];
                    let hash = crypto.createHash('md5').update(withoutTag + pjson.version).digest('hex');
                    let replace = '';

                    if (stashed.indexOf(hash) > -1) {
                        replace = '<static ref="' + hash + '"></static>';
                    } else {
                        replace = "<!-- static " + hash + " -->" + withoutTag + END_TAG;
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
        res.render = function (view: string, options: any, fn: any) {
            if (fn === undefined) {
                // @ts-ignore
                originalRender.call(this, view, options, (err: any, out: any) => {
                    res.send(out);
                });
            } else {
                // @ts-ignore
                originalRender.call(this, view, options, fn);
            }
        };

        next();
    }

}

module.exports = stash;