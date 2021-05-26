// sizes: 2000x2000 below because chrome doesn't support "any" keyword: https://bugs.chromium.org/p/chromium/issues/detail?id=1107123

export default ({ name, description }) => `{
  "name": "${name}",
  "description": "${description}",
  "icons": [
    {
      "src": "favicon.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "favicon.svg",
      "sizes": "2000x2000",
      "type": "image/svg+xml"
    }
  ],
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#f66300",
  "background_color": "#ffffff"
}`
