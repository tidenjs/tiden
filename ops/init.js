import fs from "fs/promises"
import o from "outdent"

import createStream from "./createStream.js"
import createNano from "./createNano.js"
import faviconPng from "./init/favicon.png.js"
import faviconSvg from "./init/favicon.svg.js"
import indexHtml from "./init/index.html.template.js"
import indexJs from "./init/index.js.template.js"
import appJs from "./init/app.js.template.js"
import manifestJson from "./init/manifest.json.template.js"

import createPage from "./createPage.js"

export default async function init({ name, description, isTest }) {
  await Promise.all([
    fs.writeFile(`index.html`, indexHtml({ name, description, isTest })),
    fs.writeFile(`index.js`, indexJs()),
    fs.writeFile(`app.js`, appJs()),
    fs.writeFile(`manifest.json`, manifestJson({ name, description })),
    fs.writeFile(`favicon.png`, faviconPng()),
    fs.writeFile(`favicon.svg`, faviconSvg()),
  ])

  await createNano({ name: `template` })
  await createPage({ name: `home`, pathname: `/` })
  await createStream({
    name: `page`,
    body: o`
      let page
      yield respondTo(\`set\`, \`page\`, function* (newPage) {
        page = newPage
        return page
      })

      yield respondTo(\`get\`, \`page\`, function* () {
        return page
      })
    `,
  })
}
