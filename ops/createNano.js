import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"
import camelToSnake from "../lib/camelToSnake.js"
import importsBuilder from "./importsBuilder.js"

export default async function createStream({
  path,
  name,
  body,
  imports,
  args = [],
}) {
  imports = imports || {}
  const realPath = path ? `app/${path}` : `app`

  const file = `${realPath}/nanos/${name}.js`
  const demo = `${realPath}/nanos/${name}/demo.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A nano '${name}' already exists`)
  }

  await mkdirp(realPath + `/nanos/${name}`)
  await createNanoFile(path, name, file, body, imports, args)
  await createNanoDemo(path, name, demo)
}

async function createNanoFile(path, name, file, body, imports, args) {
  const allImports = importsBuilder({
    tiden: {
      connect: [`connect`],
      s: [`s`],
    },
  })

  if (name !== `template`) {
    allImports.add({
      "./template.js": {
        default: [`template`],
      },
    })
  }

  const nss = path ? path.split(`/`) : []

  if (nss.length === 0) {
    nss.push(`x`)
  }

  if (!body) {
    body = o`
      yield template(root, function*(root) {
        
      })
    `
  }

  allImports.add(imports)

  await fs.writeFile(
    file,
    o`
      ${allImports}

      export default function* ${name}(root${
      args.length > 0 ? `, ${args.join(`, `)}` : ``
    }) {
        ${body.replace(/\n/g, `\n  `)}
      }
    `
  )
}

async function createNanoDemo(path, name, file) {
  await fs.writeFile(
    file,
    o`
      import nano from "../${name}.js"

      export const examples = {
        
        default: function* () {
          yield nano()
        }
      }
    `
  )
}
