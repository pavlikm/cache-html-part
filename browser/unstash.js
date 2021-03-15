(function(){
    var t = 'static';
    var d = document;
    var s = sessionStorage;
    var x = d.getElementsByTagName(t);
    while (x.length > 0) {
        var tmp = document.createElement('template');
        tmp.innerHTML = s.getItem(x[0].getAttribute("ref"));
        d.getElementsByTagName(t)[0].replaceWith(tmp.content.cloneNode(true));
        x = d.getElementsByTagName(t);
    }
}());