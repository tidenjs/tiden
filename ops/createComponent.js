import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"
import camelToSnake from "../lib/camelToSnake.js"
import importsBuilder from "./importsBuilder.js"

export default async function createComponent({
  path,
  name,
  body,
  imports,
  args,
  css,
}) {
  const havePath = path !== `` && path !== `/` && path !== `./` && path !== undefined
  const haveAppDir = process.cwd().indexOf(`/app/`) !== -1
  let resolvePath

  if (havePath && haveAppDir)  {
    resolvePath = path
  }

  if (!havePath && !haveAppDir)  {
    resolvePath = `app`
  }

  if (!havePath && haveAppDir)  {
    resolvePath = ``
  }

  if (havePath && !haveAppDir)  {
    resolvePath = `app/${path}/`
  }

  const componentPath = resolvePath ? `${resolvePath}/components` : `components`
  const file = `${componentPath}/${name}.js`
  const demo = `${componentPath}/${name}/demo.js`
  const cssFile = `${componentPath}/${name}/css.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A component '${name}' already exists`)
  }

  await mkdirp(`${componentPath}/${name}`)
  await createComponentFile(resolvePath, name, file, body, imports, args)
  await createCss(resolvePath, name, cssFile, css)
  await createComponentDemo(resolvePath, name, demo)
}

async function createComponentFile(path, name, file, body, imports, args = []) {
  const nss = path ? path.split(`/`).filter(dir => dir !== `app` && !!dir) : []
  const allImports = importsBuilder({
    tiden: {
      html: [`html`],
      component: [`component`],
    },
    [`./${path ? `${path}/` : ``}${name}/css.js`]: {
      default: [`css`],
    },
  })
  if (imports) {
    allImports.add(imports)
  }

  if (nss.length === 0) {
    nss.push(`x`)
  }

  const tagName = `${nss.join(`-`)}-${camelToSnake(name)}`

  await fs.writeFile(
    file,
    o`
      ${allImports}

      component(\`${tagName}\`, { css }, function ${name}({ ${[
      `language`,
      ...args,
    ].join(`, `)} }) {
        ${getBody()}
      })
    `
  )

  function getBody() {
    if (!body) {
      body = o`
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
      export const path = new URL(import.meta.url + \`/../../${name}.js\`)

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

async function createCss(path, name, file, css) {
  css = css || `* { font-size: 24px }`

  await fs.writeFile(
    file,
    o`
      import { css } from "tiden"

      export default css\`
        ${css.split(`\n`).join(`\n  `)}
      \`
    `
  )
}
