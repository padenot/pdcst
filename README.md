pdcst
=====

Because vowels are so 2011, yo.

```
├── data                          # example podcast feeds
│   ├── bleep.xml
│   └── hotflush.xml
├── index.html
├── js
│   ├── fxosstub.js
│   └── podcast.js                # the things here
├── LICENSE.TXT
├── manifest.webapp
├── README.md
└── style
    ├── fxosstub.css
    ├── images
    │   └── blahblah.png
    └── podcast.css
```

Install <https://addons.mozilla.org/en-US/firefox/addon/forcecors/> in your
Firefox so it can do cross-origin stuff, to test in the browser. Open the add-on
and click the CORS button on the right side.

```
cd data && python -m SimpleHTTPServer 1234
python -m SimpleHTTPServer 1235
firefox localhost:1235
```
