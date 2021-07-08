import tmpdir from "../test/tmpdir.js"
import createStream from "./createStream.js"
import fs from "fs/promises"
import { expect } from "chai"
import o from "outdent"

let dir
beforeEach(async () => {
  dir = await tmpdir()
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true })
})

describe(`createStream`, async () => {
  it(`should create stream file`, async () => {
    await createStream({ path: `app`, name: `niagara` })

    const expected = o`
      import {stream} from "tiden"

      export default stream(\`niagara\`, function* niagara({respondTo}) {
        yield respondTo(\`get\`, \`niagara\`, function*() {
          return \`I'm here!\`
        })
      })`

    expect(await fs.readFile(`app/streams/niagara.js`, `utf8`)).to.equal(
      expected
    )
  })

  it(`should update imports`, async () => {
    await createStream({ path: `app`, name: `niagara` })

    const expected = o`
      import niagara from "./streams/niagara.js"

      export default function* streams() {
        yield niagara
      }
    `

    expect(await fs.readFile(`app/streams.js`, `utf8`)).to.equal(expected)
  })
})
