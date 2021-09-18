import fs from "fs/promises"
import { expect } from "chai"
import o from "outdent"
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
    beforeEach(async () => {
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`return empty string with undefined`, async () => {
      const path = undefined
      expect(await translator(path)).to.be.equal(``)
    })

    it(`return empty string with null`, async () => {
      const path = null 
      expect(await translator(path)).to.be.equal(``)
    })
  })

  describe(`app path given`, () => {
    beforeEach(async () => {
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`return namespace after path`, async () => {
      expect(await translator(`app/east/asia`)).to.be.equal(`east/asia`)
    })

    it(`return namespace after path`, async () => {
      expect(await translator(`app/east`)).to.be.equal(`east`)
    })

    it(`return '' with only app`, async () => {
      expect(await translator(`app`)).to.be.equal(``)
    })

  })

  describe(`invalid path and cwd`, () => {
    it(`should throw error`, async () => {
      await mkdirp(`lib`)
      process.chdir(`lib`)
      try {
        await translator(`lib`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        const cwd = `/private${dir}/lib`
        expect(e.message).to.equal(`Cannot translate using ${cwd} folder`)
      }
    })
  })

  describe(`app as cwd`, () => {
    beforeEach(async () => {
      await Promise.all([
        fs.writeFile(`manifest.json`, o`whatever`),
        mkdirp(`app`)
      ])
      process.chdir(`app`)
    })

    it(`return namespace after app`, async () => {
      expect(await translator(`app/east/asia`)).to.be.equal(`east/asia`)
      expect(await translator(`east/asia`)).to.be.equal(`east/asia`)
    })

    it(`return namespace after app`, async () => {
      expect(await translator(`app/east`)).to.be.equal(`east`)
      expect(await translator(`east`)).to.be.equal(`east`)
    })

    it(`return '' with only app`, async () => {
      expect(await translator(`app`)).to.be.equal(``)
    })
  })

  describe(`complex cwd with no namespace`, () => {
    beforeEach(async () => {
      await Promise.all([
        fs.writeFile(`manifest.json`, o`whatever`),
        mkdirp(`app/bubble/tea/with/milk`)
      ])
      process.chdir(`app/bubble/tea/with/milk`)
    })

    it(`return namespace after app`, async () => {
      expect(await translator()).to.be.equal(`bubble/tea/with/milk/`)
    })

    it(`return namespace after app`, async () => {
      expect(await translator(``)).to.be.equal(`bubble/tea/with/milk/`)
    })
  })

  describe(`complex cwd with complex namespace`, () => {
    beforeEach(async () => {
      await Promise.all([
        fs.writeFile(`manifest.json`, o`whatever`),
        mkdirp(`app/bubble/tea/with/milk`)
      ])
      process.chdir(`app/bubble/tea/with/milk`)
    })

    it(`return namespace after app + path`, async () => {
      expect(await translator(`mix/cheese/cream`)).to.be.equal(`bubble/tea/with/milk/mix/cheese/cream`)
    })
  })

  describe(`complex cwd with app/n/a/m/e/space`, () => {
    beforeEach(async () => {
      await Promise.all([
        fs.writeFile(`manifest.json`, o`whatever`),
        mkdirp(`app/bubble/tea/with/milk`)
      ])
      process.chdir(`app/bubble/tea/with/milk`)
    })

    it(`return namespace after app path only`, async () => {
      expect(await translator(`app/mix/cheese/cream`)).to.be.equal(`mix/cheese/cream`)
    })
  })
})
