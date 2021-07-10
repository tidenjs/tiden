import createStream from "../createStream.js"
import fs from "fs/promises"
import o from "outdent"
import { expect } from "chai"
import mkdirp from "../../lib/mkdirp.js"

export default function () {
  describe(`with existing files`, () => {
    beforeEach(async () => {
      await mkdirp(`app/streams`)
      await fs.writeFile(
        `app/streams/niagara.js`,
        o`
        import {stream} from "tiden"

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
        await createStream({ path: `app`, name: `niagara` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A stream niagara already exists in app`)
      }
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
