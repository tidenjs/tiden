import tmpdir from "../test/tmpdir.js"
import createPage from "./createPage.js"
import fs from "fs/promises"
import { expect } from "chai"

import singleLevelNewFiles from "./createPage.test/singleLevelNewFiles.js"
import singleLevelExistingFiles from "./createPage.test/singleLevelExistingFiles.js"

import multiLevelNewFiles from "./createPage.test/multiLevelNewFiles.js"
import multiLevelExistingFiles from "./createPage.test/multiLevelExistingFiles.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`createPage`, () => {
  describe(`single level`, () => {
    singleLevelNewFiles()
    singleLevelExistingFiles()
  })

  describe(`multi level`, () => {
    multiLevelNewFiles()
    multiLevelExistingFiles()
  })
})
