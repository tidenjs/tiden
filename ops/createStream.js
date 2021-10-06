import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createStream({ namespace, name, body }) {
  namespace = namespace ? `app/${namespace}` : `app`

  const file = `${namespace}/streams/${name}.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A stream '${name}' already exists in app`)
  }

  await mkdirp(namespace + `/streams`)
  await createStreamFile(namespace, name, file, body)
  await addToStreamsList(namespace, name)
  await addToNs(namespace)
  await addToGrandParents(namespace)
}

async function createStreamFile(namespace, name, file, body) {
  if (body === undefined) {
    body = o`
      yield respondTo(\`get\`, \`${name}\`, function*() {
        return \`I'm here!\`
      })
    `
  }

  body = body.replace(/\n/g, `\n  `)

  await fs.writeFile(
    file,
    o`
      import {stream, respondTo} from "tiden"

      export default stream(\`${name}\`, function* ${name}() {
        ${body}
      })
    `
  )
}

async function addToStreamsList(namespace, name) {
  const streamsFile = `${namespace}/streams.js`
  let c
  if (await fileExists(streamsFile)) {
    c = await fs.readFile(streamsFile, `utf8`)
  } else {
    c = o`
      export default function* streams() {
      }
    `
  }

  function addImport() {
    const statement = `import ${name} from "./streams/${name}.js"`
    const matcher = /(.*import.*(\nimport.*)*)/

    // add after all import statements if any
    if (c.match(matcher)) {
      c = c.replace(matcher, `$1\n${statement}`)
    } else {
      c = `${statement}\n\n${c}`
    }
  }

  function addYield() {
    const statement = `  yield ${name}`
    const matcher = /(function\*\s*streams\(\)\s*{)(.*)(}\s*)/ms
    c = c.replace(matcher, `$1$2${statement}\n$3`)
  }

  addImport()
  addYield()

  await fs.writeFile(streamsFile, c)
}

async function addToNs(namespace) {
  const nss = namespace.split(`/`)
  const ns = nss.pop()
  const nsFile = `${namespace}.js`

  let c
  if (await fileExists(nsFile)) {
    c = await fs.readFile(nsFile, `utf8`)
  } else {
    c = o`
      import {fork} from "tiden"

      export function* streams() {
      }
    `
  }

  const matcher = /^(.*)(\s+)(export function\*\s*streams\(\)\s*{)(.*)(}\s*)/ms

  const importStatement = `import myStreams from "./${ns}/streams.js"`
  const forkStatement = `\n  yield fork(myStreams)`

  if (!c.includes(importStatement)) {
    c = c.replace(matcher, `$1${importStatement}\n$2$3${forkStatement}$4$5`)
  }

  await fs.writeFile(nsFile, c)
}

async function addToGrandParents(namespace) {
  const nss = namespace.split(`/`)

  for (let i = nss.length - 2; i >= 0; i--) {
    const ns = nss[i]
    const nextNs = nss[i + 1]
    const nsFile = [...nss.slice(0, i), ``].join(`/`) + `${ns}.js`

    let c
    if (await fileExists(nsFile)) {
      c = await fs.readFile(nsFile, `utf8`)
    } else {
      c = o`
        import {fork} from "tiden"

        export function* streams() {
        }
      `
    }

    const matcher =
      /^(.*)(\s+)(export function\*\s*streams\(\)\s*{)(.*)(}\s*)/ms

    const importStatement = `import {streams as ${nextNs}Streams} from "./${ns}/${nextNs}.js"`
    const forkStatement = `  yield fork(${nextNs}Streams)`

    c = c.replace(matcher, `$1${importStatement}\n$2$3$4${forkStatement}\n$5`)

    await fs.writeFile(nsFile, c)
  }
}
