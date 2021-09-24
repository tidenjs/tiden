import { expect } from "chai"
import o from "outdent"
import replace from "./replaceAllTidenUrls.js"

describe(`replaceAllTidenUrls`, () => {
  it(`should replace version in any tiden url`, () => {
    const result = replace(
      o`
        <script type="importmap">
          {
            imports: {
              "tiden": "https://cdn.jsdelivr.net/npm/tiden@0.1.0/tiden.js",
              "tiden/": "https://cdn.jsdelivr.net/npm/tiden@0.2.0/"
            }
          }
        </script>

        <script data-initial src="https://cdn.jsdelivr.net/npm/tiden@whatever/init.js"></script>
    `,
      { version: `0.5.0` }
    )

    expect(result).to.be.equal(o`
      <script type="importmap">
        {
          imports: {
            "tiden": "https://cdn.jsdelivr.net/npm/tiden@0.5.0/tiden.js",
            "tiden/": "https://cdn.jsdelivr.net/npm/tiden@0.5.0/"
          }
        }
      </script>

      <script data-initial src="https://cdn.jsdelivr.net/npm/tiden@0.5.0/init.js"></script>
    `)
  })
})
