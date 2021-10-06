import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"
import mkdirp from "../../lib/mkdirp.js"

export default function () {
  describe(`with existing page`, () => {
    beforeEach(async () => {
      await mkdirp(`app/pages`)
      await fs.writeFile(
        `app/pages/home.js`,
        o`
        import {page} from "tiden"
      `
      )
    })

    it(`should throw an error`, async () => {
      try {
        await createPage({ namespace: ``, name: `home` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A page 'home' already exists`)
      }
    })
  })

  describe(`with no existing page, but existing list and ns`, () => {
    beforeEach(async () => {
      await mkdirp(`app/pages`)
      await fs.writeFile(
        `app/pages.js`,
        o`
          import "./pages/listings.js"
        `
      )
      await fs.writeFile(
        `app.js`,
        o`
          import streams from "./app/streams.js"
          import "./app/pages.js"

          export {pages}
          export {streams}
        `
      )
    })

    it(`should add to list`, async () => {
      await createPage({ namespace: ``, name: `home` })

      expect(await read(`app/pages.js`)).to.equal(
        o`
          import "./pages/listings.js"
          import "./pages/home.js"
        `
      )
    })
  })

  async function read(file) {
    try {
      return await fs.readFile(file, `utf8`)
    } catch (e) {
      return e.message
    }
  }
}
