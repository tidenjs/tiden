import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createPage({ path, name }) {
  path = path ? `app/${path}` : `app`

  const file = `${path}/pages/${name}.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A page niagara already exists in app`)
  }

  await mkdirp(path + `/pages`)
  await createPageFile(path, name, file)
  await addToPagesList(path, name)
  await addToNs(path)
  await addToGrandParents(path)
}

async function createPageFile(path, name, file) {
  await fs.writeFile(
    file,
    o`
      import {page} from "tiden"

      export default page(\`${name}\`, function* ${name}({respondTo}) {
        yield respondTo(\`get\`, \`${name}\`, function*() {
          return \`I'm here!\`
        })
      })
    `
  )
}

async function addToPagesList(path, name) {
  const pagesFile = `${path}/pages.js`
  let c
  if (await fileExists(pagesFile)) {
    c = await fs.readFile(pagesFile, `utf8`)
  } else {
    c = o`
      export default function* pages() {
      }
    `
  }

  function addImport() {
    const statement = `import ${name} from "./pages/${name}.js"`
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
    const matcher = /(function\*\s*pages\(\)\s*{)(.*)(}\s*)/ms
    c = c.replace(matcher, `$1$2${statement}\n$3`)
  }

  addImport()
  addYield()

  await fs.writeFile(pagesFile, c)
}

async function addToNs(path) {
  const nss = path.split(`/`)
  const ns = nss.pop()
  const nsFile = `${path}.js`

  let c
  if (await fileExists(nsFile)) {
    c = await fs.readFile(nsFile, `utf8`)
  } else {
    c = o`
      import {fork} from "tiden"

      export function* pages() {
      }
    `
  }

  const matcher = /^(.*)(\s+)(export function\*\s*pages\(\)\s*{)(.*)(}\s*)/ms

  const importStatement = `import myPages from "./${ns}/pages.js"`
  const forkStatement = `\n  yield fork(myPages)`

  c = c.replace(matcher, `$1${importStatement}\n$2$3${forkStatement}$4$5`)

  await fs.writeFile(nsFile, c)
}

async function addToGrandParents(path) {
  const nss = path.split(`/`)

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

        export function* pages() {
        }
      `
    }

    const matcher = /^(.*)(\s+)(export function\*\s*pages\(\)\s*{)(.*)(}\s*)/ms

    const importStatement = `import {pages as ${nextNs}Pages} from "./${ns}/${nextNs}.js"`
    const forkStatement = `  yield fork(${nextNs}Pages)`

    c = c.replace(matcher, `$1${importStatement}\n$2$3$4${forkStatement}\n$5`)

    await fs.writeFile(nsFile, c)
  }
}
