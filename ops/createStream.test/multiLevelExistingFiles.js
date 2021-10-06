import createStream from "../createStream.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"
import mkdirp from "../../lib/mkdirp.js"

export default function () {
  describe(`when files already exist`, () => {
    beforeEach(async () => {
      await mkdirp(`app/cart/checkout/streams`)
      await fs.writeFile(
        `app/cart/checkout/streams.js`,
        o`
          import creditCard from "./streams/creditCard.js"

          export default function* streams() {
            yield creditCard
          }
        `
      )

      await fs.writeFile(
        `app/cart.js`,
        o`
          import {fork} from "tiden"
          import {streams as promotionsStreams} from "./cart/promotions.js"

          export function* streams() {
            yield fork(promotionsStreams)
          }
        `
      )

      await fs.writeFile(
        `app.js`,
        o`
          import {fork} from "tiden"
          import {streams as listingsStreams} from "./app/listings.js"

          export function* streams() {
            yield fork(listingsStreams)
          }
        `
      )

      await createStream({ namespace: `cart/checkout`, name: `personalInfo` })
    })

    it(`should create stream file`, async () => {
      expect(await read(`app/cart/checkout/streams/personalInfo.js`)).to.equal(
        o`
          import {stream, respondTo} from "tiden"

          export default stream(\`personalInfo\`, function* personalInfo() {
            yield respondTo(\`get\`, \`personalInfo\`, function*() {
              return \`I'm here!\`
            })
          })
        `
      )
    })

    it(`should update streams.js`, async () => {
      expect(await read(`app/cart/checkout/streams.js`)).to.equal(
        o`
          import creditCard from "./streams/creditCard.js"
          import personalInfo from "./streams/personalInfo.js"

          export default function* streams() {
            yield creditCard
            yield personalInfo
          }
        `
      )
    })

    it(`should import streams in grandparent ns`, async () => {
      expect(await read(`app/cart.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {streams as promotionsStreams} from "./cart/promotions.js"
          import {streams as checkoutStreams} from "./cart/checkout.js"

          export function* streams() {
            yield fork(promotionsStreams)
            yield fork(checkoutStreams)
          }
        `
      )

      expect(await read(`app.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {streams as listingsStreams} from "./app/listings.js"
          import {streams as cartStreams} from "./app/cart.js"

          export function* streams() {
            yield fork(listingsStreams)
            yield fork(cartStreams)
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
