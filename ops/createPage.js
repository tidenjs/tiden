import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createPage({ path, name, pathname }) {
  path = path ? `app/${path}` : `app`

  const file = `${path}/pages/${name}.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A page '${name}' already exists`)
  }

  await mkdirp(path + `/pages`)
  await createPageFile(path, name, file, pathname)
  await addToPagesList(path, name)
  await addToNs(path)
  await addToGrandParents(path)
}

async function createPageFile(path, name, file, pathname) {
  if (!pathname) {
    const nss = path.split(`/`)
    nss[0] = ``
    pathname = `${nss.join(`/`)}/${name}`
  }

  await fs.writeFile(
    file,
    o`
      import {nested, register, all} from "tiden"

      const id = \`one/two/${name}\`

      function* saga() {
        const [template] = (
          yield all([
            import(\`../nanos/template.js\`),
          ])
        ).map(it => it.default)

        yield nested(
          root, 
          [
            template,
            [
            ]
          ]
        )
      }

      export function interpret(url) {
        return url.pathname.match(
          new RegExp(\`^${pathname}$\`)
        )
      }

      export function generate(args) {
        return \`${pathname}\`
      }

      register({id, saga, interpret, generate})
    `
  )
}

async function addToPagesList(path, name) {
  const pagesFile = `${path}/pages.js`
  let c
  if (await fileExists(pagesFile)) {
    c = await fs.readFile(pagesFile, `utf8`)
  } else {
    c = ``
  }

  function addImport() {
    const statement = `import "./pages/${name}.js"`
    const matcher = /(.*import.*(\nimport.*)*)/

    // add after all import statements if any
    if (c.match(matcher)) {
      c = c.replace(matcher, `$1\n${statement}`)
    } else {
      c = `${statement}\n\n${c}`.trim()
    }
  }

  addImport()

  await fs.writeFile(pagesFile, c)
}

async function addToNs(path) {
  const nss = path.split(`/`)
  const ns = nss.pop()
  const nsFile = `${path}.js`

  const importStatement = `import "./${ns}/pages.js"`

  let c
  if (await fileExists(nsFile)) {
    c = await fs.readFile(nsFile, `utf8`)
    c = `${importStatement}\n${c}`
  } else {
    c = importStatement
  }

  await fs.writeFile(nsFile, c)
}

async function addToGrandParents(path) {
  const nss = path.split(`/`)

  for (let i = nss.length - 2; i >= 0; i--) {
    const ns = nss[i]
    const nextNs = nss[i + 1]
    const nsFile = [...nss.slice(0, i), ``].join(`/`) + `${ns}.js`

    const importStatement = `import "./${ns}/${nextNs}.js"`

    let c
    if (await fileExists(nsFile)) {
      c = await fs.readFile(nsFile, `utf8`)

      c = `${importStatement}\n${c}`
    } else {
      c = importStatement
    }

    await fs.writeFile(nsFile, c)
  }
}
