var t="stash",d=document,all=d.body.innerHTML.matchAll(/<!-- stash ([a-f0-9]+?) -->([\s\S]*?)<!-- stash-end -->/gim);const arr=[...all];for(var s=sessionStorage,i=0;i<arr.length;i++)s.setItem(arr[i][1],arr[i][2]);var v=Object.keys(s);d.cookie=t+"="+v+"; expires=0; path=/";