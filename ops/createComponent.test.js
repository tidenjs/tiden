import { expect } from "chai"
import fs from "fs/promises"
import o from "outdent"

import createComponent from "./createComponent.js"
import mkdirp from "../lib/mkdirp.js"
import tmpdir from "../test/tmpdir.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`createComponent`, () => {
  describe(`when already exists`, () => {
    beforeEach(async () => {
      await mkdirp(`app/one/components`)
      await fs.writeFile(
        `app/one/components/myComponent.js`,
        o`
          whatever
        `
      )
    })

    it(`should throw an error`, async () => {
      try {
        await createComponent({ path: `app/one`, name: `myComponent` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A component 'myComponent' already exists`)
      }
    })
  })

  describe(`when create outside app dir`, () => {
    beforeEach(async () => {
      await mkdirp(`app/one/two/three`)
    })

    it(`should throw an error`, async () => {
      try {
        await createComponent({ name: `myComponent` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`Cannot create component outside app directory`)
      }
    })
  })

  describe(`with no existing component`, () => {
    beforeEach(async () => {
      await createComponent({ path: `app/one`, name: `myComponent` })
    })

    it(`should create component`, async () => {
      expect(await read(`app/one/components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })

    it(`should create component demo`, async () => {
      expect(await read(`app/one/components/myComponent/demo.js`)).to.match(
        /export const examples/
      )
    })

    it(`should create css file`, async () => {
      expect(await read(`app/one/components/myComponent/css.js`)).to.match(
        /export default css\`/
      )
    })
  })

  describe(`with 1 level namespace`, async () => {
    beforeEach(async () => {
      await createComponent({ path: `app/one`, name: `myComponent` })
    })

    it(`should create component`, async () => {
      expect(await read(`app/one/components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })
  })

  describe(`with 2 level namespace`, async () => {
    beforeEach(async () => {
      await createComponent({ path: `app/one/two`, name: `myComponent` })
    })

    it(`should create component`, async () => {
      expect(await read(`app/one/two/components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })
  })

  describe(`with namespace but cwd inside a dir [app/east]`, async () => {
    beforeEach(async () => {
      await mkdirp(`app/east`)
      process.chdir(`app/east`)
      await createComponent({ path: `asia`, name: `myComponent` })
    })

    it(`should create component`, async () => {
      expect(await read(`asia/components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })
  })

  describe(`with no-namespace but cwd inside a dir [app/east]`, async () => {
    beforeEach(async () => {
      await mkdirp(`app/east`)
      process.chdir(`app/east`)
      await createComponent({ name: `myComponent`})
    })

    it(`should create component`, async () => {
      expect(await read(`components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })
  })

  describe(`with no-namespace but cwd inside a multi-level dir [app/east/asia]`, async () => {
    beforeEach(async () => {
      await mkdirp(`app/east/asia`)
      process.chdir(`app/east/asia`)
      await createComponent({ name: `myComponent`})
    })

    it(`should create component`, async () => {
      expect(await read(`components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })
  })

  describe(`with body`, () => {
    beforeEach(async () => {
      await createComponent({
        path: `app/one`,
        name: `myComponent`,
        body: o`
          return html\`Muppet show\`
        `,
      })
    })

    it(`should create component`, async () => {
      expect(await read(`app/one/components/myComponent.js`)).to.match(
        /Muppet show/
      )
    })
  })

  describe(`with imports`, () => {
    beforeEach(async () => {
      await createComponent({
        path: `app`,
        name: `myComponent`,
        imports: {
          "../someLib.js": {
            default: [`someLib`],
          },
        },
      })
    })

    it(`should include it`, async () => {
      expect(await read(`app/components/myComponent.js`)).to.include(
        `import someLib from "../someLib.js"`
      )
    })
  })

  describe(`with args`, () => {
    beforeEach(async () => {
      await createComponent({
        path: `app`,
        name: `myComponent`,
        args: [`items`],
      })
    })

    it(`should include it`, async () => {
      expect(await read(`app/components/myComponent.js`)).to.include(
        `component(\`x-my-component\`, { css }, function myComponent({ language, items }) {`
      )
    })
  })

  describe(`with css`, () => {
    beforeEach(async () => {
      await createComponent({
        path: `app`,
        name: `myComponent`,
        css: o`
          :host {
            background-color: yellow;
          }
        `,
      })
    })

    it(`should include it`, async () => {
      expect(await read(`app/components/myComponent/css.js`)).to.include(
        `:host {\n    background-color: yellow;\n  }`
      )
    })
  })
})

async function read(file) {
  try {
    return await fs.readFile(file, `utf8`)
  } catch (e) {
    return e.message
  }
}
