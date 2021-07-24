import { expect } from "chai"
import fs from "fs/promises"
import o from "outdent"

import createNano from "./createNano.js"
import mkdirp from "../lib/mkdirp.js"
import tmpdir from "../test/tmpdir.js"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`createNano`, () => {
  describe(`when already exists`, () => {
    beforeEach(async () => {
      await mkdirp(`app/one/nanos`)
      await fs.writeFile(
        `app/one/nanos/myNano.js`,
        o`
          whatever
        `
      )
    })

    it(`should throw an error`, async () => {
      try {
        await createNano({ path: `one`, name: `myNano` })
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`A nano 'myNano' already exists`)
      }
    })
  })

  describe(`with no existing nano`, () => {
    beforeEach(async () => {
      await createNano({ path: `one`, name: `myNano` })
    })

    it(`should create nano`, async () => {
      expect(await read(`app/one/nanos/myNano.js`)).to.match(/connect/)
    })

    it(`should create nano demo`, async () => {
      expect(await read(`app/one/nanos/myNano/demo.js`)).to.match(/connect/)
    })
  })

  describe(`with no namespace`, () => {
    beforeEach(async () => {
      await createNano({ name: `myNano` })
    })

    it(`should create nano`, async () => {
      expect(await read(`app/nanos/myNano.js`)).to.match(/connect/)
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
