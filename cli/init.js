import fs from "fs/promises"
import indexHtml from "./init/index.html.template.js"
import indexJs from "./init/index.js.template.js"
import manifestJson from "./init/manifest.json.template.js"
import faviconPng from "./init/favicon.png.js"
import faviconSvg from "./init/favicon.svg.js"

export default async function init({ name, tagline }) {
  fs.writeFile(`index.html`, indexHtml({ name, tagline }))
  fs.writeFile(`index.js`, indexJs())
  fs.writeFile(`manifest.json`, manifestJson({ name }))
  fs.writeFile(`favicon.png`, faviconPng())
  fs.writeFile(`favicon.svg`, faviconSvg())
}
