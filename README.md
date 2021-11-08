# cache-html-part
**cache-html-part** is express middleware, that can "stash" any static content of your page in client browser, so any other requests to the same page (or different page with same static element) will consume less data and will be rendered faster.

**cache-html-part** saves your bandwidth and reduce load speed with caching some parts of rendered html.

**This package is experimental**
## install
```javascript
npm install cache-html-part
```
As parameter to this middleware enters filter function for elements, which should be cached and count, how many rendering times this element should be rendered before apply cache.
```javascript
function (filterFunction: Function = (e: HTMLElement) => false, renderedCount: number = 1)
```
For example, for caching all divs bigger than 200 characters:
````javascript
(e) => {
    return (e.toString().length >= 200 && e.tagName == 'div')
}
````

## use
Use cache-html-part as express middleware that will cache footer:
```javascript
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const cacheHtmlPart = require('cache-html-part');

app.use(cacheHtmlPart((e) => {
    return (e.classNames.toString().toLowerCase().indexOf('footer') >= 0)
}));

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


## cache-html-part and SEO
**cache-html-part** will not affect any SEO bots and crawlers. It use html comments which are "invisible" for bots.
