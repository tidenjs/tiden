import { expect } from "chai"
import translator from "./translator.js"

import mkdirp from "../lib/mkdirp.js"
import tmpdir from "../test/tmpdir.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`translator`, () => {
  describe(`no path given`, () => {
    it(`return empty string with undefined`, () => {
      const undefinedPath = undefined
      expect(translator(path).to.be.equal(``))
    })

    it(`return empty string with null`, () => {
      const undefinedPath = null 
      expect(translator(path).to.be.equal(``))
    })
  })

  describe(`app path given`, () => {
    it(`return namespace after path`, () => {
      expect(translator(`app/east/asia`).to.be.equal(`east/asia`))
    })

    it(`return '' with only app`, () => {
      expect(translator(`app`).to.be.equal(``))
    })

  })
    /*
  describe(`invalid path and cwd`, () => {
    it(`should throw error`, () => {
      try {
        await translator(`lib`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`Cannot translate using 'lib' folder`)
      }
    })
  })
  */
  describe(`root as cwd`, () => {

  })

  describe(`app as cwd`, () => {
    beforeEach(async () => {
      await mkdirp(`app`)
      process.chdir(`app`)
    })


  })
})
