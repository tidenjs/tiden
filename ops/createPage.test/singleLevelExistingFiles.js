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
        `app/pages/niagara.js`,
        o`
        import {page} from "tiden"

        export default page(\`niagara\`, function* niagara({respondTo}) {
          yield respondTo(\`get\`, \`niagara\`, function*() {
            return \`I'm here!\`
          })
        })
      `
      )
    })

    it(`should throw an error`, async () => {
      try {
        await createPage({ path: ``, name: `niagara` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A page niagara already exists in app`)
      }
    })
  })

  describe(`with no existing page, but existing list and ns`, () => {
    beforeEach(async () => {
      await mkdirp(`app/pages`)
      await fs.writeFile(
        `app/pages.js`,
        o`
          import gullfoss from "./pages/gullfoss.js"

          export default function* pages() {
            yield gullfoss
          }
        `
      )
      await fs.writeFile(
        `app.js`,
        o`
          import pages from "./app/pages.js"

          export {pages}
        `
      )
    })

    it(`should add to list`, async () => {
      await createPage({ path: ``, name: `niagara` })

      expect(await read(`app/pages.js`)).to.equal(
        o`
          import gullfoss from "./pages/gullfoss.js"
          import niagara from "./pages/niagara.js"

          export default function* pages() {
            yield gullfoss
            yield niagara
          }
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
