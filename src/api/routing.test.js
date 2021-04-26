import { interpret, register } from "./routing.js"

const { expect } = chai

import saga from "../../test/saga.js"

describe(`routing`, async () => {
  describe(`when no match`, async () => {
    it(`it should return null when no match`, async () => {
      expect(interpret(`/chaos`)).to.equal(null)
    })
  })

  describe(`when matching`, async () => {
    function* page() {}

    before(async () => {
      register({
        page,
        id: `matchLittle`,
        interpret: (url) => url.pathname.match(/^./),
        generate: ({ id }) => `/`,
      })

      register({
        page,
        id: `myPageId`,
        interpret: (url) => url.pathname.match(/^\/my-page\/(?<id>[^/]+)$/),
        generate: ({ id }) => `/my-page/${id}`,
      })

      register({
        page,
        id: `manualInterpret`,
        interpret: (url) =>
          console.log(url) || url.searchParams.get(`toad`)
            ? { groups: { toad: url.searchParams.get(`toad`) } }
            : null,
        generate: ({ toad }) => `/?toad=${toad}`,
      })
    })

    it(`should return best match`, async () => {
      const response = interpret(`/my-page/litter-of-toads`)

      expect(response).to.exist
      expect(response.pageId).to.equal(`myPageId`)
      expect(response.id).to.equal(`litter-of-toads`)
    })

    it(`should allow manual method of return`, async () => {
      const response = interpret(`/this-doesn't-really-matter?toad=The%20King`)

      expect(response.toad).to.equal(`The King`)
    })
  })
})
