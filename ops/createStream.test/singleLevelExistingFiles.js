import createStream from "../createStream.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"
import mkdirp from "../../lib/mkdirp.js"

export default function () {
  describe(`with existing stream`, () => {
    beforeEach(async () => {
      await mkdirp(`app/streams`)
      await fs.writeFile(
        `app/streams/niagara.js`,
        o`
        import {stream, respondTo} from "tiden"

        export default stream(\`niagara\`, function* niagara({respondTo}) {
          yield respondTo(\`get\`, \`niagara\`, function*() {
            return \`I'm here!\`
          })
        })
      `
      )
    })

    it(`should throw an error`, async () => {
      try {
        await createStream({ path: ``, name: `niagara` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A stream 'niagara' already exists in app`)
      }
    })
  })

  describe(`with no existing stream, but existing list and ns`, () => {
    beforeEach(async () => {
      await mkdirp(`app/streams`)
      await fs.writeFile(
        `app/streams.js`,
        o`
          import gullfoss from "./streams/gullfoss.js"

          export default function* streams() {
            yield gullfoss
          }
        `
      )
      await fs.writeFile(
        `app.js`,
        o`
          import streams from "./app/streams.js"

          export {streams}
        `
      )
    })

    it(`should add to list`, async () => {
      await createStream({ path: ``, name: `niagara` })

      expect(await read(`app/streams.js`)).to.equal(
        o`
          import gullfoss from "./streams/gullfoss.js"
          import niagara from "./streams/niagara.js"

          export default function* streams() {
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
