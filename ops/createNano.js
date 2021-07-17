import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createStream({ path, name }) {
  const realPath = path ? `app/${path}` : `app`

  const file = `${realPath}/nanos/${name}.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A nano '${name}' already exists`)
  }

  await mkdirp(realPath + `/nanos`)
  await createNanoFile(path, name, file)
}

async function createNanoFile(path, name, file) {
  const nss = path.split(`/`)

  if (nss.length === 0) {
    nss.push(`x`)
  }
  const tagName = `${nss.join(`-`)}-${name}`

  await fs.writeFile(
    file,
    o`
      import { connect, ensure, s } from "tiden"

      export default function* ${name}(root) {
        const el = ensure(root, { tagName: \`${tagName}\` })

        yield connect(el, {
        })
      }
    `
  )
}
