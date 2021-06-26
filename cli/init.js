import fs from "fs/promises"
import indexHtml from "./init/index.html.template.js"
import indexJs from "./init/index.js.template.js"
import manifestJson from "./init/manifest.json.template.js"
import faviconPng from "./init/favicon.png.js"
import faviconSvg from "./init/favicon.svg.js"

export default async function init({ name, description, isTest }) {
  await Promise.all([
    fs.writeFile(`index.html`, indexHtml({ name, description, isTest })),
    fs.writeFile(`index.js`, indexJs()),
    fs.writeFile(`manifest.json`, manifestJson({ name, description })),
    fs.writeFile(`favicon.png`, faviconPng()),
    fs.writeFile(`favicon.svg`, faviconSvg()),
    fs.writeFile(`start`, "hotserve index.html 1100 '*'"),
  ])

  await fs.chmod(`start`, `755`)
}
