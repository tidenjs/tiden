import { expect } from "chai"
import o from "outdent"
import getOldVersion from "./getOldVersion.js"

describe(`getOldVersion`, () => {
  it(`should extract version information from url`, () => {
    const result = getOldVersion(`
      some random stuff

      whatever 

      <script data-initial src="https://cdn.jsdelivr.net/npm/tiden@13.7.6-alpha.1+wedontbuild/init.js"></script>

      whatever
    `)

    expect(result.all).to.be.equal(`13.7.6-alpha.1+wedontbuild`)
    expect(result.major).to.be.equal(13)
    expect(result.minor).to.be.equal(7)
    expect(result.patch).to.be.equal(6)
    expect(result.prerelease).to.be.equal(`alpha.1`)
    expect(result.build).to.be.equal(`wedontbuild`)
  })

  it(`should throw error when invalid`, () => {
    try {
      getOldVersion(`
        some random stuff

        whatever 

        <script data-initial src="https://cdn.jsdelivr.net/npm/muppets@13.7.6-alpha.1+wedontbuild/init.js"></script>

        whatever
      `)
    } catch (e) {
      expect(e.message).to.be.equal(`Could not extract old version info`)
      return
    }
    expect.fail()
  })
})
