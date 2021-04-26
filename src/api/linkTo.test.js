import { linkTo } from "./linkTo.js"
import { register } from "./routing.js"

const { expect } = chai

import saga from "../../test/saga.js"

describe(`linkTo`, async () => {
  it(
    `should auto-generate href, and add a onClick handler`,
    saga(function* () {
      function* page() {}
      register({
        page,
        id: `myPageId`,
        interpret: (url) => url.pathname.match(/^\/my-page\/(?<id>[^/]+)$/),
        generate: ({ id }) => `/my-page/${id}`,
      })

      const result = linkTo(
        { pageId: `myPageId`, id: `froggy` },
        { target: "_self" }
      )

      expect(result.target).to.equal(`_self`)
      expect(result.href).to.equal(`/my-page/froggy`)
      expect(result.onClick.toString()).to.equal(
        "*onClick() {\n      yield announce(`navigate`, obj)\n    }"
      )

      const result2 = linkTo({ pageId: `myPageId`, id: `froggy` })
      expect(result2.target).to.equal(`_blank`)
    })
  )
})
