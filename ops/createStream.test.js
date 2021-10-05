import tmpdir from "../test/tmpdir.js"
import createStream from "./createStream.js"
import fs from "fs/promises"
import { expect } from "chai"
import o from "outdent"

import singleLevelNewFiles from "./createStream.test/singleLevelNewFiles.js"
import singleLevelExistingFiles from "./createStream.test/singleLevelExistingFiles.js"

import multiLevelNewFiles from "./createStream.test/multiLevelNewFiles.js"
import multiLevelExistingFiles from "./createStream.test/multiLevelExistingFiles.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`createStream`, () => {
  describe(`single level`, () => {
    singleLevelNewFiles()
    singleLevelExistingFiles()
  })

  describe(`multi level`, () => {
    multiLevelNewFiles()
    multiLevelExistingFiles()
  })

  describe(`with body argument`, () => {
    it(`should create put whatever given in body`, async () => {
      await createStream({
        namespace: ``,
        name: `niagara`,
        body: `I'm a little\nmonkey`,
      })
      const expected = o`
        import {stream, respondTo} from "tiden"

        export default stream(\`niagara\`, function* niagara() {
          I'm a little
          monkey
        })
      `

      expect(await read(`app/streams/niagara.js`)).to.equal(expected)
    })
  })
})

async function read(file) {
  try {
    return await fs.readFile(file, `utf8`)
  } catch (e) {
    return e.message
  }
}
