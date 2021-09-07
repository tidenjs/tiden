import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"

export default function () {
  describe(`when no files exists`, () => {
    beforeEach(async () => {
      await createPage({ path: `one/two`, name: `myPage` })
    })

    it(`should create page file`, async () => {
      expect(await read(`app/one/two/pages/myPage.js`)).to.match(/register/)
    })

    it(`should have the correct id`, async () => {
      expect(await read(`app/one/two/pages/myPage.js`)).contains(
        o`
          const id = \`one/two/myPage\`
        `
      )
    })


    it(`should create pages.js`, async () => {
      expect(await read(`app/one/two/pages.js`)).to.equal(
        o`
        import "./pages/myPage.js"
        `
      )
    })

    it(`should import pages in ns`, async () => {
      expect(await read(`app/one/two.js`)).to.equal(
        o`
          import "./two/pages.js"
        `
      )
    })

    it(`should import pages in grandparent ns`, async () => {
      expect(await read(`app/one.js`)).to.equal(
        o`
          import "./one/two.js"
        `
      )

      expect(await read(`app.js`)).to.equal(
        o`
          import "./app/one.js"
        `
      )
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
