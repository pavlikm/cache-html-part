var fs = require('fs');
var crypto = require('crypto');
var pjson = require('./package.json');

function stash(req, res, next) {
    var originalSend = res.send;
    const START_TAG = '<!-- stash -->';
    const END_TAG = '<!-- stash-end -->';
    var needStashScript, needUnstashScript = false;
    res.send = function (chunk) {
        if (chunk.toString() && chunk.toString().indexOf(START_TAG) > -1 && chunk.toString().indexOf(END_TAG) > -1 ) {
            let stashed = req.headers.cookie ? req.headers.cookie.split("=").pop().split(",") : [];
            var matchAll = chunk.toString().matchAll(/<!-- stash -->([\s\S]*?)<!-- stash-end -->/gi);
            const arr = [...matchAll];
            for(var i=0; i<arr.length; i++){
                let withTag = arr[i][0];
                let withoutTag = arr[i][1];
                let hash = crypto.createHash('md5').update(withoutTag + pjson.version).digest('hex');
                let replace = '';
                if (stashed.indexOf(hash) > -1){
                    needUnstashScript = true;
                    replace = '<stash ref="'+hash+'"></stash>';
                } else {
                    needStashScript = true;
                    replace = "<!-- stash "+hash+" -->"+withoutTag+"<!-- stash-end -->";
                }
                chunk = chunk.toString().replace(withTag, replace);
            }
            let script = "";
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
    next();
}

module.exports = stash;