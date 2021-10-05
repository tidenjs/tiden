/*
 * All tests here assume that the project is structured as recommended:
 * - The project always has an 'app' folder
 * - The project always has a 'manifest.json' file
 *
 * This is standard, so test descriptions do not mention this.
 */

import fs from "fs/promises"
import { expect } from "chai"
import o from "outdent"
import analyzePath from "./analyzePath.js"

import mkdirp from "../lib/mkdirp.js"
import tmpdir from "../test/tmpdir.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`analyzePath`, () => {
  describe(`missing arguments`, () => {
    beforeEach(async () => {
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`should fail when path is undefined`, async () => {
      try {
        await analyzePath(undefined, [`init`, { name: `test` }])
        throw new Error(`It should have failed, but it didn't`)
      } catch (e) {
        return
      }
    })

    it(`should fail when path is undefined null`, async () => {
      try {
        await analyzePath(null, [`init`, { name: `test` }])
        throw new Error(`It should have failed, but it didn't`)
      } catch (e) {
        return
      }
    })
  })

  describe(`when path is 'app/east/asia'`, () => {
    let path
    beforeEach(async () => {
      path = `app/east/asia`
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`should set root to ../../..`, async () => {
      const { root } = await analyzePath(path)

      expect(root).to.be.equal(`../../..`)
    })

    it(`should set namespace to 'east/asia'`, async () => {
      const { namespace } = await analyzePath(path)
      expect(namespace).to.be.equal(`east/asia`)
    })
  })

  describe(`when path is 'app/'`, () => {
    let path
    beforeEach(async () => {
      path = `app/`
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`should set root to ..`, async () => {
      const { root } = await analyzePath(path)

      expect(root).to.be.equal(`..`)
    })

    it(`should set namespace to ''`, async () => {
      const { namespace } = await analyzePath(path)
      expect(namespace).to.be.equal(``)
    })
  })

  describe(`when path is '.'`, () => {
    let path
    beforeEach(async () => {
      path = `.`
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`should set root to .`, async () => {
      const { root } = await analyzePath(path)

      expect(root).to.be.equal(`.`)
    })

    it(`should set namespace to ''`, async () => {
      const { namespace } = await analyzePath(path)
      expect(namespace).to.be.equal(``)
    })
  })

  describe(`when path is './'`, () => {
    let path
    beforeEach(async () => {
      path = `./`
      await fs.writeFile(`manifest.json`, o`whatever`)
    })

    it(`should set root to .`, async () => {
      const { root } = await analyzePath(path)

      expect(root).to.be.equal(`.`)
    })

    it(`should set namespace to ''`, async () => {
      const { namespace } = await analyzePath(path)
      expect(namespace).to.be.equal(``)
    })
  })

  describe(`when path is in root but not a namespace (e.g. ./lib)`, () => {
    it(`should throw error`, async () => {
      await mkdirp(`lib`)
      try {
        await analyzePath(`lib`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`Cannot analyze 'lib' folder`)
      }
    })
  })

  describe(`when noRoot is set, and there is no root`, () => {
    it(`should set namespace to ''`, async () => {
      const { namespace } = await analyzePath(`.`, { noRoot: true })
      expect(namespace).to.be.equal(``)
    })

    it(`should set root to '.'`, async () => {
      const { root } = await analyzePath(`.`, { noRoot: true })
      expect(root).to.be.equal(`.`)
    })
  })

  describe(`when noRoot is set, and there IS a root`, () => {
    // noRoot flag is only set when the command expects no repository to exist

    it(`should fail with message`, async () => {
      await fs.writeFile(`manifest.json`, o`whatever`)

      try {
        await analyzePath(`.`, { noRoot: true })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`This path already has a Tiden project.`)
      }
    })
  })

  describe(`when path is absolute path /tmp/temp/app/namespace`, () => {
    it(`should do same as relative path`, async () => {
      await fs.writeFile(`manifest.json`, o`whatever`)
      await mkdirp(`app`)
      await mkdirp(`app/namespace`)
      const relative = await analyzePath(`./app/namespace`)
      const absolute = await analyzePath(process.cwd() + `/app/namespace`)
      expect(relative).to.be.deep.equal(absolute)
    })
  })

  describe(`when in reserved folders`, () => {
    for (const reserved of [`components`, `pages`, `streams`, `nanos`]) {
      describe(`when in ${reserved} folder`, () => {
        it(`should not include ${reserved} in namespace`, async () => {
          await fs.writeFile(`manifest.json`, o`whatever`)
          const { namespace } = await analyzePath(
            `./app/east/asia/${reserved}/navigationBar/whatever`
          )
          expect(namespace).to.be.equal(`east/asia`)
        })
      })
    }

    describe(`when in a reserved root folder`, () => {
      it(`should not include components in namespace`, async () => {
        await fs.writeFile(`manifest.json`, o`whatever`)
        const { namespace } = await analyzePath(
          `./app/east/asia/components` // note, no trailing slash
        )
        expect(namespace).to.be.equal(`east/asia`)
      })
    })
  })
})
