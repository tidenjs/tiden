export default ({ name, description, isTest }) => `<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<link rel="shortcut icon" href="favicon.png" type="image/png" />
<link rel="manifest" href="manifest.json" />
<title>${name}</title>
<script type="importmap">
  {
    "imports": {
      "redux-saga": "https://cdn.jsdelivr.net/npm/redux-saga@^1.1.3/dist/redux-saga-core.esmodules-browsers.js?module",
      "redux-saga/effects.js": "https://cdn.jsdelivr.net/npm/redux-saga@^1.1.3/dist/redux-saga-effects.esmodules-browsers.js?module",
      "redux": "https://cdn.jsdelivr.net/npm/redux@^4.0.4/es/redux.mjs",
      "reselect": "https://cdn.jsdelivr.net/npm/reselect@^4.0.0/es/index.js",
      "tiden": "${
        isTest
          ? `http://localhost:1105/tiden.js`
          : `https://cdn.jsdelivr.net/gh/tidenjs/tiden/tiden.js`
      }",
      "router": "${
        isTest
          ? `http://localhost:1105/tiden/lib/api/routing.js`
          : `https://cdn.jsdelivr.net/gh/tidenjs/tiden/tiden/lib/api/routing.js`
      }"
    }
  }
</script>

<div data-initial aria-hidden="true" style="height: 0; width: 0; opacity: 0; overflow: hidden;">
<!-- This will be shown in excerpts when you copy a link to this site, for example in Facebook -->
  ${description}
</div>

<script data-initial src="https://unpkg.com/es-module-shims@^0.11.1/dist/es-module-shims.js"></script>

<script data-initial>
  try {
    new Function('import("")') // trigger an error in very old browsers

    const contents = Object.assign(document.createElement('script'), {
      type: 'module',
      src: 'index.js'
    })

    contents.dataset.initial = ''

    document.head.appendChild(contents)
  } catch (err) {
    document.body.appendChild(Object.assign(document.createElement('span'), {
      innerHTML: "This application requires a modern web browser and we're sorry to say that yours is outdated."
    }))
  }
</script>
  `
