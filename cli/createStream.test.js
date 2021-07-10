import tmpdir from "../test/tmpdir.js"
import createStream from "./createStream.js"
import fs from "fs/promises"
import { expect } from "chai"

import singleLevelNewFiles from "./createStream.test/singleLevelNewFiles.js"
import singleLevelExistingFiles from "./createStream.test/singleLevelExistingFiles.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  //await fs.rm(dir, { recursive: true })
})

describe(`createStream`, () => {
  describe(`when no module`, () => {
    it(`should fail`, async () => {
      try {
        await createStream({ path: ``, name: `niagara` })
        throw new Error(`It did not throw  an error as expected`)
      } catch (e) {
        expect(e.message).to.equal(`Can't create stream outside of module.`)
      }
    })
  })

  describe(`single level`, () => {
    singleLevelNewFiles()
    singleLevelExistingFiles()
  })
})
