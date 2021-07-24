import createStream from "../createStream.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"

export default function () {
  describe(`when no files exists`, () => {
    beforeEach(async () => {
      await createStream({ path: ``, name: `niagara` })
    })

    it(`should create stream file`, async () => {
      const expected = o`
        import {stream, respondTo} from "tiden"

        export default stream(\`niagara\`, function* niagara() {
          yield respondTo(\`get\`, \`niagara\`, function*() {
            return \`I'm here!\`
          })
        })
      `

      expect(await read(`app/streams/niagara.js`)).to.equal(expected)
    })

    it(`should update streams.js`, async () => {
      const expected = o`
        import niagara from "./streams/niagara.js"

        export default function* streams() {
          yield niagara
        }
      `

      expect(await read(`app/streams.js`)).to.equal(expected)
    })

    it(`should update app.js`, async () => {
      const expected = o`
        import {fork} from "tiden"
        import myStreams from "./app/streams.js"

        export function* streams() {
          yield fork(myStreams)
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
