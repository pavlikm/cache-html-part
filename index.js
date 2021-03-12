var fs = require('fs');
var crypto = require('crypto');
var pjson = require('./package.json');

function stash(req, res, next) {
    var originalSend = res.send;
    const START_TAG = '<!-- static -->';
    const END_TAG = '<!-- static-end -->';
    var needStashScript, needUnstashScript = false;

    res.send = function (chunk) {
        if (chunk.toString() && chunk.toString().indexOf(START_TAG) > -1 && chunk.toString().indexOf(END_TAG) > -1 ) {
            let stashed = req.headers.cookie ? req.headers.cookie.split("=").pop().split(",") : [];
            var matchAll = chunk.toString().matchAll(/<!-- static -->([\s\S]*?)<!-- static-end -->/gi);
            const arr = [...matchAll];
            for(var i=0; i<arr.length; i++){
                let withTag = arr[i][0];
                let withoutTag = arr[i][1];
                let hash = crypto.createHash('md5').update(withoutTag + pjson.version).digest('hex');
                let replace = '';
                if (stashed.indexOf(hash) > -1){
                    needUnstashScript = true;
                    replace = '<static ref="'+hash+'"></static>';
                } else {
                    needStashScript = true;
                    replace = "<!-- static "+hash+" -->"+withoutTag+"<!-- static-end -->";
                }
                chunk = chunk.toString().replace(withTag, replace);
            }
            let script = "/* cache-html-part "+pjson.version+"*/";
            if(needStashScript){
                script += fs.readFileSync(__dirname + '/browser/stash-minified.js', 'utf8');
            }
            if(needUnstashScript){
                script += fs.readFileSync(__dirname + '/browser/unstash-minified.js', 'utf8');
            }
            arguments[0] = chunk.toString().replace(/(<\/body>)/, "<script>"+script+"</script>\n\n$1");
            res.setHeader('Content-Length', chunk.length);
        }
        originalSend.apply(res, arguments);
    };
    var _render = res.render;
    res.render = function( view, options, fn ) {
        if(fn === undefined){
            _render.call( this, view, options, (err, out) => {
                res.send(out);
            } );
        } else {
            _render.call( this, view, options, fn);
        }
    };
    next();
}

module.exports = stash;