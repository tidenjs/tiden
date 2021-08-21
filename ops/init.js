import fs from "fs/promises"
import o from "outdent"

import createPage from "./createPage.js"
import createStream from "./createStream.js"
import createNano from "./createNano.js"
import createComponent from "./createComponent.js"
import faviconPng from "./init/favicon.png.js"
import faviconSvg from "./init/favicon.svg.js"
import indexHtml from "./init/index.html.template.js"
import indexJs from "./init/index.js.template.js"
import appJs from "./init/app.js.template.js"
import manifestJson from "./init/manifest.json.template.js"
import * as touchable from "./init/touchable.js"

export default async function init({ name, description, isTest }) {
  await Promise.all([
    fs.writeFile(`index.html`, indexHtml({ name, description, isTest })),
    fs.writeFile(`index.js`, indexJs()),
    fs.writeFile(`app.js`, appJs()),
    fs.writeFile(`manifest.json`, manifestJson({ name, description })),
    fs.writeFile(`favicon.png`, faviconPng()),
    fs.writeFile(`favicon.svg`, faviconSvg()),
    fs.writeFile(`.prettierrc.json`, `{\n  "semi": false\n}`),
  ])

  await createComponent({
    name: `template`,
    body: o`
      return html\`<div><slot></slot></div>\`
    `,
  })
  await createNano({
    name: `template`,
    body: o`
      render(html\`<x-template></x-template>\`, root)

      yield fork(child, root.children[0])
    `,
    imports: {
      tiden: { render: [`render`], html: [`html`], fork: [`fork`] },
      "../components/template.js": {
        default: [``],
      },
    },
    args: [`child`],
  })
  await createNano({
    name: `home`,
  })
  await createComponent({
    name: `viewHome`,
    body: o`
      return html\`Hurray! You're here.\`
    `,
  })
  await createComponent({
    name: `touchable`,
    imports: touchable.bodyImports,
    args: touchable.bodyArgs,
    body: touchable.body(),
    css: touchable.css(),
  })
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
  await createStream({
    name: `language`,
    body: o`
      let language = \`en\`
      yield respondTo(\`set\`, \`language\`, function* (newLanguage) {
        language = newLanguage
        return language
      })

      yield respondTo(\`get\`, \`language\`, function* () {
        return language
      })
    `,
  })
}
