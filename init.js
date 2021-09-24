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

function addImportMapShim() {
  const el = document.createElement(`script`)
  el.setAttribute(`async`, ``)
  el.src = `https://unpkg.com/es-module-shims@0.12.1/dist/es-module-shims.js`
  el.dataset.initial = ``
  document.head.appendChild(el)
}

function startApp() {
  const el = document.createElement(`script`)
  el.src = `${window.root || `./`}index.js`
  el.type = `module`
  document.head.appendChild(el)
}

if (!browserSupport()) {
  window.outdated(`No dynamic modules.`)
} else {
  addImportMapShim()
  startApp()
}
