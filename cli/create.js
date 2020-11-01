import lineinfile from "../import/lineinfile.js"

export default async function create(identifier) {
  if (
    !identifier ||
    [`--help`, `help`].includes(identifier) ||
    !identifier.match(/^[a-zA-Z/]+$/)
  ) {
    console.error(`Usage 1: tiden create <ns[/module[/type[/name]]]>

  ns/module/type/component must match /^[a-zA-Z/]+$/

  It will create necessary files, folders, and adjust import and export statements accordingly. The same command can be run several times without consequences. Only necessary changes will be applied.

  Examples: 
      Create a new nano called thankYouYes. The module "myModule" and the namespace "onboarding" will be created if they aren't already existing:

      ./create.mjs onboarding/myModule/nanos/thankYouYes


  Usage 2: tiden create <ns[/concepts[/concept]]>

  It will create the concept in the namespace.
  `)
    return
  }

  const [ns, ...rest] = identifier.split(`/`)

  if (ns) {
    await createNs(ns)
  }

  if (rest[0] === `concepts`) {
    const [_, concept] = rest

    if (concept) {
      await createConcept(ns, concept)
    }
  } else {
    const [module, type, nano] = rest

    if (module) {
      await createModule(ns, module)
    }

    if (type) {
      await createType(ns, module, type)
    }

    if (nano) {
      await createNano(ns, module, type, nano)
    }
  }
})()

async function createNano(ns, module, type, nano) {
  const nanoPath = `./src/${ns}/${module}/${type}/${nano}.js`
  const component = nano.replace(/[A-Z]/, (str) => `-${str.toLowerCase()}`)

  await lineInFile({
    path: `./src/${ns}/${module}/${type}.js`,
    line: `export { default as ${nano} } from "./nanos/${nano}.js"`,
  })

  await lineInFile({
    path: nanoPath,
    line: `import "https://cdn1.lingio.com/ui/_/components2/${ns}/views/${component}/${component}-1.js"

import { announce, cancel, connectedElement, fork, waitFor, s } from "../../../mop.js"

export default function* ${nano}(root) {
  const el = document.createElement(\`${ns}-${component}\`)
  root.appendChild(el)

  yield fork(function* worker() {
    yield* connectedElement(el, [\`uiLanguage\`], { language })

    yield waitFor(\`${nano}/finish\`)
    yield announce(\`finish\`)
    yield cancel()
  })
}

const language = s(
  (s) => s.uiLanguage,
  (language) => {
    return language
  }
)`,
    regex: /export default/,
  })

  await lineInFile({
    path: `./src/${ns}/${module}/${type}/${nano}/demo.js`,
    regex: /export default/,
    line: `import { fork } from "../../../../import/redux-saga/effects.js"
import * as core from "../../../../core.js"
import nano from "../${nano}.js"

export default function ${nano}({ Storage, describe, it }) {
  describe(\`on demo\`, function* () {
    const appStorage = Storage(\`app\`)
    appStorage.set(\`url\`, \`https://demo.staging.lingio.com\`)
    yield fork(core.concepts, appStorage)

    it(\`should show\`, nano)
  })
}
`,
  })

  // demo.html
  await lineInFile({
    path: `./demo.html`,
    line: `  // prettier-ignore\n  const demos = {\n}`,
    regex: /const demos = {}/,
  })
  await lineInFile({
    path: `./demo.html`,
    line: `  demos.${ns} = {}`,
    insertAfter: /const demos = {/,
  })
  await lineInFile({
    path: `./demo.html`,
    line: `  demos.${ns}.${module} = [\n  ]`,
    regex: new RegExp(`demos.${ns}.${module}: \\[`),
    insertAfter: new RegExp(`  demos.${ns} = {}`),
  })
  await lineInFile({
    path: `./demo.html`,
    line: `    \`${nano}\`,`,
    insertAfter: new RegExp(`demos.${ns}.${module}: `),
  })
}

async function createType(ns, module, type) {
  await lineInFile({
    path: `./src/${ns}/${module}.js`,
    line: `export * as ${type} from "./${module}/${type}.js"`,
  })

  await lineInFile({
    path: `./src/${ns}/${module}/${type}.js`,
    line: ``,
  })
}

async function createModule(ns, module) {
  const modulePath = `./src/${ns}/${module}.js`

  await lineInFile({
    path: modulePath,
    line: ``,
  })

  await lineInFile({
    path: `./src/${ns}.js`,
    line: `import * as ${module} from "./${ns}/${module}.js"`,
    insertAfter: /import/,
  })

  await lineInFile({
    path: `./src/${ns}.js`,
    line: `  ${module},`,
    insertAfter: /export const modules/,
  })
}

async function createConcept(ns, concept) {
  const conceptsVar = `${ns}Concepts`
  const storageVar = `${ns}Storage`

  await lineInFile({
    path: `./src/${ns}.js`,
    line: `export { default as concepts } from "./${ns}/concepts.js"`,
    insertAfter: /import/,
  })

  await lineInFile({
    path: `./src/${ns}/concepts.js`,
    line: `export default function* ${conceptsVar}(storage) {\n}`,
    regex: /export default function/,
    insertBefore: `BOF`,
  })

  await lineInFile({
    path: `./src/init.js`,
    line: `import { concepts as ${conceptsVar} } from "./${ns}.js"`,
    insertBefore: /import/,
  })

  await lineInFile({
    path: `./src/init.js`,
    line: `  yield fork(${conceptsVar}, ${storageVar})`,
    insertAfter: /fork namespace concepts here/,
  })

  await lineInFile({
    path: `./src/${ns}/concepts.js`,
    line: `export default function* ${conceptsVar}(storage) {\n}`,
    regex: /export default function/,
    insertBefore: `BOF`,
  })

  // this is for the newly added concept
  await lineInFile({
    path: `./src/${ns}/concepts.js`,
    line: `import ${concept} from "./concepts/${concept}.js"`,
    insertAfter: `import.*from`,
  })
  await lineInFile({
    path: `./src/${ns}/concepts.js`,
    line: `  yield fork(${concept}, storage)`,
    insertBefore: /^\}$/,
  })
  await lineInFile({
    path: `./src/${ns}/concepts/${concept}.js`,
    regex: /export default function/,
    line: `import { respondTo } from "../../mop.js"

export default function* ${concept}() {
  yield respondTo(\`get\`, \`${concept}\`, function* () {
    return \`Hello, I'm ${concept}\`
  })
}`,
  })
}

async function createNs(ns) {
  const storageVar = `${ns}Storage`

  await lineInFile({
    path: `./src/${ns}.js`,
    line: `// prettier-ignore
export const modules = [
]`,
    insertAfter: /import/,
    regex: /export const modules/,
  })

  await lineInFile({
    path: `./src/init.js`,
    line: `  // fork namespace concepts here`,
    insertAfter: /export default function\* init/,
  })

  await lineInFile({
    path: `./src/init.js`,
    line: `  // create storages here`,
    insertAfter: /export default function\* init/,
  })

  await lineInFile({
    path: `./src/init.js`,
    line: `  const ${storageVar} = Storage(\`${ns}\`)`,
    insertAfter: /create storages here/,
  })
}
