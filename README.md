# stash
Stash is express middleware, that can "stash" any static content of your page in client browser, so any other requests to the same page (or different page with same static element) will consume less data and will be rendered faster.

Stash save your bandwidth and reduce load speed with caching some parts of rendered html.

## install
```javascript
npm install stash
```

## use
Use Stash as express middleware:
```javascript
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const stash = require('stash');

app.use(stash);

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
and mark any static part of your page with html comment `<!-- stash -->` and `<!-- stash-end -->`:
```html
<html>
<head></head>
<body>

<div>This div will be transfered from server again and again and again... even if is still the same...</div>

<!-- stash -->
<div>But this div will be transfered only once! And client browser will "stash" it for later</div>
<!-- stash-end -->

</body>
</html>
```
for more examples check project stash-example.

## stash and SEO
Stash will not affect any SEO bots and crawlers. It use html comments which are "invisible" for bots, so indexe page will be original and not html with stash marks.
