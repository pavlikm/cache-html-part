var fs = require('fs');
var crypto = require('crypto');
var pjson = require('./package.json');

function stash(req, res, next) {
    var originalSend = res.send;
    var originalEnd = res.end;
    var originalRender = res.render;
    const START_TAG = '<!-- static -->';
    const END_TAG = '<!-- static-end -->';
    var needStashScript, needUnstashScript = false;

    res.send = function (chunk) {
        if (chunk.toString() && chunk.toString().indexOf(START_TAG) > -1 && chunk.toString().indexOf(END_TAG) > -1 && !req.xhr) {
            let stashed = req.headers.cookie ? req.headers.cookie.split("=").pop().split(",") : [];
            var matchAll = chunk.toString().matchAll(/<!-- static -->([\s\S]*?)<!-- static-end -->/gi);
            const arr = [...matchAll];
            for (var i = 0; i < arr.length; i++) {
                let withTag = arr[i][0];
                let withoutTag = arr[i][1];
                let hash = crypto.createHash('md5').update(withoutTag + pjson.version).digest('hex');
                let replace = '';
                if (stashed.indexOf(hash) > -1) {
                    needUnstashScript = true;
                    replace = '<static ref="' + hash + '"></static>';
                } else {
                    needStashScript = true;
                    replace = "<!-- static " + hash + " -->" + withoutTag + END_TAG;
                }
                if(i === arr.length-1){
                    let script = "/* cache-html-part " + pjson.version + "*/";
                    if (needStashScript) {
                        script += fs.readFileSync(__dirname + '/browser/stash-minified.js', 'utf8');
                    }
                    if (needUnstashScript) {
                        script += fs.readFileSync(__dirname + '/browser/unstash-minified.js', 'utf8');
                    }
                    replace += '<script>'+script+'</script>';
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
    res.end = function (chunk) {
        if(typeof chunk == "string") {
            res.send(chunk);
        } else {
            originalEnd.call(this, chunk);
        }
    };

    next();
}

module.exports = stash;