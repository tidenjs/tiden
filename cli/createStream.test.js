import tmpdir from "../test/tmpdir.js"
import createStream from "./createStream.js"
import fs from "fs/promises"
import { expect } from "chai"

import singleLevelNewFiles from "./createStream.test/singleLevelNewFiles.js"
import singleLevelExistingFiles from "./createStream.test/singleLevelExistingFiles.js"

import multiLevelNewFiles from "./createStream.test/multiLevelNewFiles.js"
import multiLevelExistingFiles from "./createStream.test/multiLevelExistingFiles.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  //await fs.rm(dir, { recursive: true })
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
})
