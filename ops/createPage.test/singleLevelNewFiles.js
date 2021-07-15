import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"

export default function () {
  describe(`when no files exists`, () => {
    beforeEach(async () => {
      await createPage({ path: ``, name: `niagara` })
    })

    it(`should create page file`, async () => {
      const expected = o`
        import {page} from "tiden"

        export default page(\`niagara\`, function* niagara({respondTo}) {
          yield respondTo(\`get\`, \`niagara\`, function*() {
            return \`I'm here!\`
          })
        })
      `

      expect(await read(`app/pages/niagara.js`)).to.equal(expected)
    })

    it(`should update pages.js`, async () => {
      const expected = o`
        import niagara from "./pages/niagara.js"

        export default function* pages() {
          yield niagara
        }
      `

      expect(await read(`app/pages.js`)).to.equal(expected)
    })

    it(`should update app.js`, async () => {
      const expected = o`
        import {fork} from "tiden"
        import myPages from "./app/pages.js"

        export function* pages() {
          yield fork(myPages)
        }
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
