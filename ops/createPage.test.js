import { expect } from "chai"
import fs from "fs/promises"
import o from "outdent"

import createPage from "./createPage.js"
import multiLevelExistingFiles from "./createPage.test/multiLevelExistingFiles.js"
import multiLevelNewFiles from "./createPage.test/multiLevelNewFiles.js"
import singleLevelExistingFiles from "./createPage.test/singleLevelExistingFiles.js"
import singleLevelNewFiles from "./createPage.test/singleLevelNewFiles.js"
import tmpdir from "../test/tmpdir.js"

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

  describe(`with pathname argument`, () => {
    it(`should use it`, async () => {
      await createPage({ name: `hello`, pathname: `/custom/path` })

      expect(await read(`app/pages/hello.js`)).contains(
        o`
          new RegExp(\`^/custom/path$\`)
        `
      )

      expect(await read(`app/pages/hello.js`)).contains(
        o`
          return \`/custom/path\`
        `
      )
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
