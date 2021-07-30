import { interpret, register } from "./routing.js"

const { expect } = chai

import saga from "saga"

describe(`routing`, async () => {
  describe(`when no match`, async () => {
    it(`it should return null when no match`, async () => {
      expect(interpret(`/chaos`)).to.equal(null)
    })
  })

  describe(`when matching`, async () => {
    function* saga() {}

    before(async () => {
      register({
        saga,
        id: `matchLittle`,
        interpret: (url) => url.pathname.match(/^./),
        generate: ({ id }) => `/`,
      })

      register({
        saga,
        id: `myPageId`,
        interpret: (url) =>
          url.pathname.match(/^\/my-page\/(?<someparam>[^/]+)$/),
        generate: ({ id }) => `/my-page/${id}`,
      })

      register({
        saga,
        id: `manualInterpret`,
        interpret: (url) =>
          url.searchParams.get(`toad`)
            ? { groups: { toad: url.searchParams.get(`toad`) } }
            : null,
        generate: ({ toad }) => `/?toad=${toad}`,
      })
    })

    it(`should return best match`, async () => {
      const response = interpret(`/my-page/litter-of-toads`)

      expect(response).to.exist
      expect(response.id).to.equal(`myPageId`)
      expect(response.someparam).to.equal(`litter-of-toads`)
    })

    it(`should allow manual method of return`, async () => {
      const response = interpret(`/this-doesn't-really-matter?toad=The%20King`)

      expect(response.toad).to.equal(`The King`)
    })
  })
})
