export default ({ name }) => `{
  "short_name": "${name}",
  "name": "${name}",
  "icons": [
    {
      "src": "favicon.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ],
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#f66300",
  "background_color": "#ffffff"
}`
