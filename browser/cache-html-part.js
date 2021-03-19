(function(){
    var t = 'static';
    var d = document;
    var all = d.body.innerHTML.matchAll(/<!-- static ([a-f0-9]+?) -->([\s\S]*?)<!-- static-end -->/gmi);
    const arr = [...all];
    var s = sessionStorage;
    for (var i = 0; i < arr.length; i++) {
        s.setItem(arr[i][1], arr[i][2]);
    }

    var v = Object.keys(s);
    d.cookie = t + '=' + v + '; expires=0; path=/';
}());

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