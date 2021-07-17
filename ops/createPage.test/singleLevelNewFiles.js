import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"

export default function () {
  describe(`when no files exists`, () => {
    beforeEach(async () => {
      await createPage({ path: ``, name: `home` })
    })

    it(`should create page file`, async () => {
      expect(await read(`app/pages/home.js`)).to.match(/register/)
    })

    it(`should create pages.js`, async () => {
      expect(await read(`app/pages.js`)).to.equal(
        o`
          import "./pages/home.js"
        `
      )
    })

    it(`should update app.js`, async () => {
      const expected = o`
        import "./app/pages.js"
      `

      expect(await read(`app.js`)).to.equal(expected)
    })
  })
}

async function read(file) {
  try {
    return await fs.readFile(file, `utf8`)
  } catch (e) {
    return e.message
  }
}
