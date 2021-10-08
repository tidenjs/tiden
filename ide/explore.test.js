import { expect } from "chai"
import explore from "./explore.js"

describe(`finder`, () => {
  it(`should find all demo.js file and deduce type from path`, async () => {
    async function getFiles({ include }) {
      expect(include).to.be.equal(`**/demo.js`)

      return [
        `app/components/navigationBar/demo.js`,
        `app/someNamespace/components/main/demo.js`,
        `app/streams/stream1/demo.js`,
        `app/nanos/nano1/demo.js`,
        `app/main/onboarding/special/pages/start/demo.js`,
      ]
    }

    const result = await explore(getFiles)

    expect(result).to.deep.equal({
      components: [
        {
          type: `component`,
          id: `navigationBar`,
          namespace: ``,
          path: `app/components/navigationBar.js`,
          demoPath: `app/components/navigationBar/demo.js`,
          cssPath: `app/components/navigationBar/css.js`,
        },
        {
          type: `component`,
          id: `main`,
          namespace: `someNamespace`,
          path: `app/someNamespace/components/main.js`,
          demoPath: `app/someNamespace/components/main/demo.js`,
          cssPath: `app/someNamespace/components/main/css.js`,
        },
      ],
      streams: [
        {
          type: `stream`,
          id: `stream1`,
          namespace: ``,
          path: `app/streams/stream1.js`,
        },
      ],
      nanos: [
        {
          type: `nano`,
          id: `nano1`,
          namespace: ``,
          path: `app/nanos/nano1.js`,
          demoPath: `app/nanos/nano1/demo.js`,
        },
      ],
      pages: [
        {
          type: `page`,
          id: `start`,
          namespace: `main/onboarding/special`,
          path: `app/main/onboarding/special/pages/start.js`,
          demoPath: `app/main/onboarding/special/pages/start/demo.js`,
        },
      ],
    })
  })
})
