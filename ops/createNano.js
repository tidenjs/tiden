import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createStream({ path, name }) {
  const realPath = path ? `app/${path}` : `app`

  const file = `${realPath}/nanos/${name}.js`
  const demo = `${realPath}/nanos/${name}/demo.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A nano '${name}' already exists`)
  }

  await mkdirp(realPath + `/nanos/${name}`)
  await createNanoFile(path, name, file)
  await createNanoFile(path, name, demo)
}

async function createNanoFile(path, name, file) {
  const nss = path.split(`/`)

  if (nss.length === 0) {
    nss.push(`x`)
  }
  const tagName = `${nss.join(`-`)}-view-${name}`

  await fs.writeFile(
    file,
    o`
      import { connect, s } from "tiden"

      export default function *${name}(root) {
        const el = document.createElement(\`${tagName}\`)

        root.innerHTML = \`\`
        root.appendChild(el)

        yield connect(el, {
          language: s(\`language\`)
        })
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
