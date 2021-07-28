import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"
import camelToSnake from "../lib/camelToSnake.js"

export default async function createComponent({ path, name, body }) {
  const realPath = path ? `app/${path}` : `app`

  const file = `${realPath}/components/${name}.js`
  const demo = `${realPath}/components/${name}/demo.js`
  const css = `${realPath}/components/${name}/css.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A component '${name}' already exists`)
  }

  await mkdirp(realPath + `/components/${name}`)
  await createComponentFile(path, name, file, body)
  await createCss(path, name, css)
  await createComponentDemo(path, name, demo)
}

async function createComponentFile(path, name, file, body) {
  const nss = path ? path.split(`/`) : []

  if (nss.length === 0) {
    nss.push(`x`)
  }

  const tagName = `${nss.join(`-`)}-${camelToSnake(name)}`

  await fs.writeFile(
    file,
    o`
      import { html, component } from "tiden"

      import css from "./${path}/css.js"

      component(\`${tagName}\`, { css }, function ${name}({isReady, language}) {
        ${getBody()}
      })
    `
  )

  function getBody() {
    if (!body) {
      body = o`
        if (!isReady) {
          return \`...\`
        }

        return html\`
          Hello! I'm ${tagName}
        \`
      `
    }

    return body.replace(/\n/g, `\n  `)
  }
}

async function createComponentDemo(path, name, file) {
  await fs.writeFile(
    file,
    o`
      import component from "../${name}.js"

      export const examples = {

        "not ready": function (el) {
          el.isReady = undefined
        },
        
        default: function (el, {metric}) {
          el.isReady = true
          el.language = \`en\`
        }
      }
    `
  )
}

async function createCss(path, name, file) {
  await fs.writeFile(
    file,
    o`
      import { css } from "tiden"

      return css\`
        * { font-size: 24px }
      \`
    `
  )
}
