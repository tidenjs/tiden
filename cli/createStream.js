import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createStream({ path, name }) {
  await mkdirp(path + `/streams`)
  await createStreamFile(path, name)
  await addToIndex(path, name)
  await addToParents(resolve(path).split(/(?!\\)\//))
}

async function createStreamFile(path, name) {
  await fs.writeFile(
    `${path}/streams/${name}.js`,
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

async function addToIndex(path, name) {
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

async function* addToParents(parts) {
  if (parts.length > 0) {
    const name = parts.pop()
    const path = parts.join(`/`)

    const streamsFile = `${path}/streams.js`
    let c
    if (await fileExists(streamsFile)) {
      c = await fs.readFile(streamsFile, `utf8`)
    } else {
      c = o`
        import {fork} from "tiden"

        export default function* streams() {
        }
      `
    }

    c = `import ${name} from "${path}/${name}/streams.js"
${c.replace(
  /(function\* streams() {)(.*)(}\s*)/,
  `\\1\\2  yield fork(${name})\n\\3`
)}`
    await fs.writeFile(streamsFile, c)
  }
}
