import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"

export default function () {
  describe(`when no files exists`, () => {
    beforeEach(async () => {
      await createPage({ path: `cart/checkout`, name: `personalInfo` })
    })

    it(`should create page file`, async () => {
      expect(await read(`app/cart/checkout/pages/personalInfo.js`)).to.equal(
        o`
          import {page} from "tiden"

          export default page(\`personalInfo\`, function* personalInfo({respondTo}) {
            yield respondTo(\`get\`, \`personalInfo\`, function*() {
              return \`I'm here!\`
            })
          })
        `
      )
    })

    it(`should create pages.js`, async () => {
      expect(await read(`app/cart/checkout/pages.js`)).to.equal(
        o`
          import personalInfo from "./pages/personalInfo.js"

          export default function* pages() {
            yield personalInfo
          }
        `
      )
    })

    it(`should import pages in ns`, async () => {
      expect(await read(`app/cart/checkout.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import myPages from "./checkout/pages.js"

          export function* pages() {
            yield fork(myPages)
          }
        `
      )
    })

    it(`should import pages in grandparent ns`, async () => {
      expect(await read(`app/cart.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {pages as checkoutPages} from "./cart/checkout.js"

          export function* pages() {
            yield fork(checkoutPages)
          }
        `
      )

      expect(await read(`app.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {pages as cartPages} from "./app/cart.js"

          export function* pages() {
            yield fork(cartPages)
          }
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
