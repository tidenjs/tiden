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
        await createComponent({ path: `one`, name: `myComponent` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A component 'myComponent' already exists`)
      }
    })
  })

  describe(`with no existing component`, () => {
    beforeEach(async () => {
      await createComponent({ path: `one`, name: `myComponent` })
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
        /return css\`/
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
        path: `one`,
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
})

async function read(file) {
  try {
    return await fs.readFile(file, `utf8`)
  } catch (e) {
    return e.message
  }
}