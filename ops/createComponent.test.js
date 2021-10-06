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
        await createComponent({ namespace: `one`, name: `myComponent` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A component 'myComponent' already exists`)
      }
    })
  })

  describe(`with no existing component`, () => {
    beforeEach(async () => {
      await createComponent({ namespace: `one`, name: `myComponent` })
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

  describe(`with no namespace`, () => {
    beforeEach(async () => {
      await createComponent({ name: `myComponent` })
    })

    it(`should create component`, async () => {
      expect(await read(`app/components/myComponent.js`)).to.match(
        /component\(.*\)/
      )
    })
  })

  describe(`with body`, () => {
    beforeEach(async () => {
      await createComponent({
        namespace: `one`,
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
