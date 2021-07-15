import createPage from "../createPage.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"
import mkdirp from "../../lib/mkdirp.js"

export default function () {
  describe(`when files already exist`, () => {
    beforeEach(async () => {
      await mkdirp(`app/cart/checkout/pages`)
      await fs.writeFile(
        `app/cart/checkout/pages.js`,
        o`
          import creditCard from "./pages/creditCard.js"

          export default function* pages() {
            yield creditCard
          }
        `
      )

      await fs.writeFile(
        `app/cart.js`,
        o`
          import {fork} from "tiden"
          import {pages as promotionsPages} from "./cart/promotions.js"

          export function* pages() {
            yield fork(promotionsPages)
          }
        `
      )

      await fs.writeFile(
        `app.js`,
        o`
          import {fork} from "tiden"
          import {pages as listingsPages} from "./app/listings.js"

          export function* pages() {
            yield fork(listingsPages)
          }
        `
      )

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

    it(`should update pages.js`, async () => {
      expect(await read(`app/cart/checkout/pages.js`)).to.equal(
        o`
          import creditCard from "./pages/creditCard.js"
          import personalInfo from "./pages/personalInfo.js"

          export default function* pages() {
            yield creditCard
            yield personalInfo
          }
        `
      )
    })

    it(`should import pages in grandparent ns`, async () => {
      expect(await read(`app/cart.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {pages as promotionsPages} from "./cart/promotions.js"
          import {pages as checkoutPages} from "./cart/checkout.js"

          export function* pages() {
            yield fork(promotionsPages)
            yield fork(checkoutPages)
          }
        `
      )

      expect(await read(`app.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {pages as listingsPages} from "./app/listings.js"
          import {pages as cartPages} from "./app/cart.js"

          export function* pages() {
            yield fork(listingsPages)
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
