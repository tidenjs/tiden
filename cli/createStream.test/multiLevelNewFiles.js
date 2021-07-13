import createStream from "../createStream.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"

export default function () {
  describe(`when no files exists`, () => {
    beforeEach(async () => {
      await createStream({ path: `cart/checkout`, name: `personalInfo` })
    })

    it(`should create stream file`, async () => {
      expect(await read(`app/cart/checkout/streams/personalInfo.js`)).to.equal(
        o`
          import {stream} from "tiden"

          export default stream(\`personalInfo\`, function* personalInfo({respondTo}) {
            yield respondTo(\`get\`, \`personalInfo\`, function*() {
              return \`I'm here!\`
            })
          })
        `
      )
    })

    it(`should create streams.js`, async () => {
      expect(await read(`app/cart/checkout/streams.js`)).to.equal(
        o`
          import personalInfo from "./streams/personalInfo.js"

          export default function* streams() {
            yield personalInfo
          }
        `
      )
    })

    it(`should import streams in ns`, async () => {
      expect(await read(`app/cart/checkout.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import myStreams from "./checkout/streams.js"

          export function* streams() {
            yield fork(myStreams)
          }
        `
      )
    })

    it(`should import streams in grandparent ns`, async () => {
      expect(await read(`app/cart.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {streams as checkoutStreams} from "./cart/checkout.js"

          export function* streams() {
            yield fork(checkoutStreams)
          }
        `
      )

      expect(await read(`app.js`)).to.equal(
        o`
          import {fork} from "tiden"
          import {streams as cartStreams} from "./app/cart.js"

          export function* streams() {
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
