var fs = require('fs');
var crypto = require('crypto');
var pjson = require('./package.json');

function stash(req, res, next) {
    var originalSend = res.send;
    var originalEnd = res.end;
    var originalRender = res.render;
    const START_TAG = '<!-- static -->';
    const END_TAG = '<!-- static-end -->';
    var routeInitialized = false;

    let script = fs.readFileSync(__dirname + '/browser/cache-html-part.min.js', 'utf8');
    let scriptUrl = crypto.createHash('sha1').update(script).digest('hex') + "/cache-html-part.min.js";
    let integrity = crypto.createHash('md5').update(script).digest('hex');
    if(!routeInitialized){
        routeInitialized = true;
        res.app.get("/"+scriptUrl, (req, res) => {
            res.set('Cache-control', 'public, max-age=3600');
            var html = fs.readFileSync(__dirname + '/browser/cache-html-part.min.js', 'utf8');
            res.write(html);
            res.end();
        })
    }

    res.send = function (chunk) {
        if (chunk && chunk.toString() && chunk.toString().indexOf(START_TAG) > -1 && chunk.toString().indexOf(END_TAG) > -1 && !req.xhr) {
            let stashed = req.headers.cookie ? req.headers.cookie.split("=").pop().split(",") : [];
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
                if(i === arr.length-1){
                    replace += '<script src="/'+scriptUrl+'" type="text/javascript" integrity="'+integrity+'"></script>';
                }
                chunk = chunk.toString().replace(withTag, replace);
            }

            arguments[0] = chunk.toString();
            res.setHeader('Content-Length', chunk.length);
        }
        originalSend.apply(res, arguments);
    };

    res.render = function (view, options, fn) {
        if (fn === undefined) {
            originalRender.call(this, view, options, (err, out) => {
                res.send(out);
            });
        } else {
            originalRender.call(this, view, options, fn);
        }
    };

    next();
}

module.exports = stash;
