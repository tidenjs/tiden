// clients run this script at the very start of the application lifecycle

function browserSupport() {
  // test for browser support
  try {
    new Function('import("")') // trigger an error in very old browsers

    return true
  } catch (err) {
    return false
  }
}

function addImportMap() {
  const base = document.currentScript.src.replace(/\/init.js$/, `/`)

  let importmap = document.querySelector(`[type=importmap]`)

  if (!importmap) {
    importmap = Object.assign(document.createElement(`script`), {
      type: `importmap`,
      innerHTML: `{}`,
    })
    document.head.appendChild(importmap)
  }

  let json
  try {
    json = JSON.parse(importmap.innerHTML)
  } catch (e) {
    console.error(`Importmap does not contain valid JSON, overwriting it.`)
    json = {}
  }

  json.imports = {
    ...(json.imports || {}),
    tiden: base + "tiden.js",
    "tiden/": base,
    "lit-html": "https://cdn.jsdelivr.net/npm/lit-html@1.4.1/lit-html.js",
    "lit-html/": "https://cdn.jsdelivr.net/npm/lit-html@1.4.1/",
    "redux-saga":
      "https://cdn.jsdelivr.net/npm/redux-saga@^1.1.3/dist/redux-saga-core.esmodules-browsers.js?module",
    "redux-saga/effects.js":
      "https://cdn.jsdelivr.net/npm/redux-saga@^1.1.3/dist/redux-saga-effects.esmodules-browsers.js?module",
    redux: "https://cdn.jsdelivr.net/npm/redux@^4.0.4/es/redux.mjs",
    reselect: "https://cdn.jsdelivr.net/npm/reselect@^4.0.0/es/index.js",
  }

  importmap.innerHTML = JSON.stringify(json, null, 2)
}

function addImportMapShim() {
  document.write(
    `<script data-initial async src="https://unpkg.com/es-module-shims@0.12.1/dist/es-module-shims.js"></script>`
  )
}

function startApp() {
  document.write(
    `<script async data-initial type="module" src="${
      window.root || `./`
    }index.js"></script>`
  )
}

if (!browserSupport()) {
  window.outdated(`No dynamic modules.`)
} else {
  addImportMapShim()
  addImportMap()
  startApp()
}
