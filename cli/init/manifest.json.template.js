export default ({ name }) => `{
  "short_name": "${name}",
  "name": "${name}",
  "icons": [
    {
      "src": "favicon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#f66300",
  "background_color": "#ffffff"
}`
