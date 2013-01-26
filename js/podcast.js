function $(d, query) {
  if (query) {
    return d.querySelector(query);
  }
  return document.querySelector(d);
}

function $$(d, query) {
  if (query) {
    return d.querySelectorAll(query);
  }
  return document.querySelectorAll(d);
}

function nodelist2array(nl) {
  if (nl instanceof Array) {
    return;
  }
  var arr = [];
  for(var i = nl.length; i--; arr.unshift(nl[i]));
  return nl;
}

// Convert a DOM tree that has a depth of 1 in a js object that has the
// following layout:
//"tagname": {
//  "value": "tag value, may be empty",
//  "attr": {
//    "attr1": "attr1 value",
//    "attr2": "attr2 value",
//  }
//},
function dom2obj(dom) {
  function nodeContent(node) {
    var c = nodelist2array(node.childNodes);
    if (c.length == 0) {
      return node.textContent;
    } else if (c.length == 1 &&
               c[0] instanceof Text) {
    return c[0].textContent;
    } else {
      dom2obj(c);
    }
  }
  function attrs(node) {
    if (node instanceof Array) {
      return attrs(node[node.length - 1]);
    } else {
      var obj = {};
      var l = node.attributes.length;
      if (l != 0) {
        for (var j = 0; j < l; j++) {
          var nodeName = node.attributes[j].nodeName;
          var nodeValue = node.attributes[j].nodeValue;
          obj[nodeName] = nodeValue;
        }
      }
      return obj;
    }
  }
  var o = {},
  d = dom.childNodes;
  for (var i in d) {
    if (d[i] instanceof Element) {
      var currentTagName = d[i].tagName;
      if (o[currentTagName] != undefined) {
        var bck = o[currentTagName];
        o[currentTagName] = [];
        o[currentTagName].push(bck);
        o[currentTagName].push(nodeContent(d[i]));
      } else {
        o[currentTagName] = nodeContent(d[i]);
      }
      o[currentTagName]._attr = {};
      // store the attributes as a child object |_attr|.
      o[currentTagName]._attr = attrs(d[i]);
    }
  }
  return o;
}

function e(tag, attr, content) {
  var e = document.createElement(tag);
  for (var i in attr) {
    e.setAttribute(i, attr[i]);
  }
  e.innerHTML = content;
  return e;
}

function XHR(url, method, data, onsuccess, onfailure, onprogress, onload, onabort) {
  var request = new XMLHttpRequest();
  // Ten seconds is ought to be enough for anybody.
  var xhrtimeout = setTimeout(onfailure, 10000);
  request.addEventListener("progress", onprogress, false);
  request.addEventListener("load", onprogress, false);
  request.addEventListener("error", onfailure, false);
  request.addEventListener("abort", onabort, false);
  request.addEventListener("readystatechange", function (e) {
    if (request.readyState == 4) {
      if (request.status == 200) {
        clearTimeout(xhrtimeout);
        onsuccess(request.responseText);
      } else {
        onfailure(e);
      }
    }
  });

  request.open(method, url, true);
  request.send(data);
}

function FeedList() {
  this.list = [];
}

FeedList.prototype.init() {
  // get shit from indexDB or something.
}

FeedList.prototype.add(url) {

}

FeedList.prototype.refresh() {
  // check wifi time and stuff
  // segment the work so we don't knock the network down
  // or not
}


FeedList.prototype.import(opml) {
  // probably not v1, but well.
}

function Feed(url) {
  this.url = url;
  this.episodes = [];
}

Feed.prototype.fetch = function() {
  var _this = this;
  XHR(this.url, "GET", null, function(data) {
    _this.parse(data);
  }, function(e) {
    console.log(e.text);
  }, function() {
    console.log("Progress.");
  }, function() {
    console.log("Load.");
  }, function() {
    console.log("Abort.");
  });
}

Feed.prototype.parse = function(data) {
  var p = new DOMParser();
  var d = p.parseFromString(data, "text/xml").documentElement;
  this.name = $(d, "channel > title");
  $(".body").appendChild(e("div", {}, this.name.textContent));
  this.image = $(d, "channel image url");
  $(".body").appendChild(e("img", {src: this.image.textContent}));
  var items = $$(d, "item");
  for (var i in items) {
    if (items[i] instanceof Element) {
      this.episodes.push(dom2obj(items[i]));
    }
  }
  this.onEndParsed(this.episodes);
}

function FeedView(feed) {
  this.feed = feed;
  this.episodeViews = [];
}

FeedView.prototype.display = function(node) {
  for (var i in this.feed) {
    this.episodeViews.push(new EpisodeView(this.feed[i]));
  }
  for (var i in this.episodeViews) {
    if (i != undefined) {
      this.episodeViews[i].display(node);
    }
  }
}

function EpisodeView(episode) {
  this.title = episode.title;
  this.author = episode["author"] || episode["itunes:author"];
  this.description = episode["description"];
  this.url = episode.enclosure._attr.url;
}

EpisodeView.prototype.display = function (node) {
  node.innerHTML += "<div class=episode-view>"
                 + "<div class=title>" + this.title + "</div>"
                 + "<div class=author>" + this.author + "</div>"
                 + "<div class=description>" + this.description+ "</div>"
                 + "<audio controls preload=none><source src="
                 +     this.url
                 + "></audio>"
                 + "</div>";
}

document.addEventListener("DOMContentLoaded", function () {
  var f = new Feed("http://localhost/bleep.xml");
  f.onEndParsed = function(episodes) {
    var v = new FeedView(episodes);
    $(".body").appendChild(e("div", {class : "feed-view"}));
    v.display($(".feed-view"));
  }
  f.fetch();
});
