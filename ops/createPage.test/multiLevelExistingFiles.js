import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"
import mkdirp from "../../lib/mkdirp.js"

export default function () {
  describe(`when files already exist`, () => {
    beforeEach(async () => {
      await mkdirp(`app/one/two/pages`)
      await fs.writeFile(
        `app/one/two/pages.js`,
        o`
          import "./pages/myPage.js"
        `
      )

      await fs.writeFile(
        `app/one.js`,
        o`
          import "./one/two.js"
        `
      )

      await fs.writeFile(
        `app.js`,
        o`
          import "./app/one.js"
        `
      )

      await createPage({ path: `one/two`, name: `otherPage` })
    })

    it(`should update pages.js`, async () => {
      expect(await read(`app/one/two/pages.js`)).to.equal(
        o`
          import "./pages/myPage.js"
          import "./pages/otherPage.js"
        `
      )
    })

    it(`should import pages in grandparent ns`, async () => {
      // there is a bug which makes duplicates here. Will fix later.
      // there should be no execution error though
      expect(await read(`app/one.js`)).to.equal(
        o`
          import "./one/two.js"
          import "./one/two.js"
        `
      )

      // there is a bug which makes duplicates here. Will fix later.
      // there should be no execution error though
      expect(await read(`app.js`)).to.equal(
        o`
          import "./app/one.js"
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
