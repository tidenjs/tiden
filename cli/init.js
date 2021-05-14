import fs from "fs/promises"
import indexHtml from "./init/index.html.template.js"
import indexJs from "./init/index.js.template.js"

export default async function init({ name, tagline }) {
  fs.writeFile(`index.html`, indexHtml({ name, tagline }))
  fs.writeFile(`index.js`, indexJs())
}
