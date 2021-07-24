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
  document.head.appendChild(
    Object.assign(document.createElement("script"), {
      type: "importmap",
      innerHTML: JSON.stringify({
        imports: {
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
        },
      }),
    })
  )
}

function addImportMapShim() {
  const shim = Object.assign(document.createElement("script"), {
    type: "script",
    src: "https://unpkg.com/es-module-shims@0.12.1/dist/es-module-shims.js",
  })
  shim.setAttribute(`async`, ``)
  shim.dataset.initial = true
  document.head.appendChild(shim)
}

function startApp() {
  const init = Object.assign(document.createElement("script"), {
    type: "module",
    src: "./index.js",
  })
  init.setAttribute("async", "")
  init.dataset.initial = ""
  document.head.appendChild(init)
}

if (!browserSupport()) {
  window.outdated(`No dynamic modules.`)
} else {
  addImportMapShim()
  addImportMap()
  startApp()
}
