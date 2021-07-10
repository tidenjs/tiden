import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createStream({ path, name }) {
  if (!path) {
    throw new Error(`Can't create stream outside of module.`)
  }

  const file = `${path}/streams/${name}.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A stream niagara already exists in app`)
  }

  await mkdirp(path + `/streams`)
  await createStreamFile(path, name, file)
  await addToStreamsList(path, name)
  await addToModule(path)
}

async function createStreamFile(path, name, file) {
  await fs.writeFile(
    file,
    o`
      import {stream} from "tiden"

      export default stream(\`${name}\`, function* ${name}({respondTo}) {
        yield respondTo(\`get\`, \`${name}\`, function*() {
          return \`I'm here!\`
        })
      })
    `
  )
}

async function addToStreamsList(path, name) {
  const streamsFile = `${path}/streams.js`
  let c
  if (await fileExists(streamsFile)) {
    c = await fs.readFile(streamsFile, `utf8`)
  } else {
    c = o`

      export default function* streams() {
      }
    `
  }

  const matcher = /(function\*\s*streams\(\)\s*{)(.*)(}\s*)/ms

  c = o`
    import ${name} from "./streams/${name}.js"
    ${c.replace(matcher, `$1$2  yield ${name}\n$3`)}
  `
  await fs.writeFile(streamsFile, c)
}

async function addToModule(path) {
  const modules = path.split(`/`)
  const module = modules.pop()
  const moduleFile = `${path}.js`

  let c
  if (await fileExists(moduleFile)) {
    c = await fs.readFile(moduleFile, `utf8`)
    c = o`
      import streams from "./${module}/streams.js"
      ${c}
      export {streams}
    `
  } else {
    c = o`
      import streams from "./${module}/streams.js"

      export {streams}
    `
  }

  await fs.writeFile(moduleFile, c)
}
