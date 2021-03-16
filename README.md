# cache-html-part
**cache-html-part** is express middleware, that can "stash" any static content of your page in client browser, so any other requests to the same page (or different page with same static element) will consume less data and will be rendered faster.

**cache-html-part** saves your bandwidth and reduce load speed with caching some parts of rendered html.

## install
```javascript
npm install cache-html-part
```

## use
Use cache-html-part as express middleware:
```javascript
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const cacheHtmlPart = require('cache-html-part');

app.use(cacheHtmlPart);

//send html from file
app.get("/test", (req, res) => {
    var html = fs.readFileSync('./views/index.html', 'utf8');
    res.send(html);
});

//use twig for render
app.get('/twig', function(req, res){
    res.render('index.twig', {
        time : new Date()
    });
});

server.listen(8080, () => {});

```
and mark any static part of your page with html comment `<!-- static -->` and `<!-- static-end -->`:
```html
<html>
<head></head>
<body>

<div>This div will be transfered from server again and again and again... even if is still the same...</div>

<!-- static -->
<div>But this div will be transfered only once! Next time browser will render it by self.</div>
<!-- static-end -->

</body>
</html>
```

## cache-html-part and SEO
**cache-html-part** will not affect any SEO bots and crawlers. It use html comments which are "invisible" for bots.
