import fs from "fs/promises"

import fileExists from "../lib/fileExists.js"
import mkdirp from "../lib/mkdirp.js"
import { resolve } from "path"
import o from "outdent"

export default async function createPage({ namespace, name, pathname }) {
  namespace = namespace ? `app/${namespace}` : `app`

  const file = `${namespace}/pages/${name}.js`
  const exists = await fileExists(file)

  if (exists) {
    throw new Error(`A page '${name}' already exists`)
  }

  await mkdirp(namespace + `/pages`)
  await createPageFile(namespace, name, file, pathname)
  await addToPagesList(namespace, name)
  await addToNs(namespace)
  await addToGrandParents(namespace)
}

async function createPageFile(namespace, name, file, pathname) {
  const nss = namespace.split(`/`)

  const id = `${nss.slice(1).join(`/`)}/${name}`

  if (!pathname) {
    pathname = `/${nss.slice(1).join(`/`)}/${name}`
  }

  await fs.writeFile(
    file,
    o`
      import { router } from "tiden"

      const id = \`${id}\`

      function* saga(root) {
        const ${name} = (yield import(\`../nanos/${name}.js\`)).default

        yield ${name}(root)
      }

      export function interpret(url) {
        return url.pathname.match(
          new RegExp(\`^${pathname}$\`)
        )
      }

      export function generate(args) {
        return \`${pathname}\`
      }

      router.register({id, saga, interpret, generate})
    `
  )
}

async function addToPagesList(namespace, name) {
  const pagesFile = `${namespace}/pages.js`
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

async function addToNs(namespace) {
  const nss = namespace.split(`/`)
  const ns = nss.pop()
  const nsFile = `${namespace}.js`

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

async function addToGrandParents(namespace) {
  const nss = namespace.split(`/`)

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
