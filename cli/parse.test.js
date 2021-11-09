import { expect } from "chai"
import o from "outdent"

import {
  init,
  createStream,
  createComponent,
  createPage,
  createNano,
  upgrade,
} from "../ops.js"
import ide from "../ide.js"
import parse from "./parse.js"

describe(`cli`, () => {
  describe(`init`, () => {
    it(`should pass name of app`, () => {
      expect(parse(`init`, `myApp`)).to.be.deep.equal([
        init,
        { name: `myApp`, description: undefined },
      ])
    })

    it(`should pass description`, () => {
      expect(
        parse(`init`, `myApp`, `--description=hey it's a thing`)
      ).to.be.deep.equal([
        init,
        { name: `myApp`, description: `hey it's a thing` },
      ])
    })

    it(`should pass shorthand description`, () => {
      expect(parse(`init`, `myApp`, `-d`, `hey it's a thing`)).to.be.deep.equal(
        [init, { name: `myApp`, description: `hey it's a thing` }]
      )
    })
  })

  describe(`start`, () => {
    it(`should start ide`, () => {
      expect(parse(`start`)).to.be.deep.equal([ide, {}])
    })
  })

  describe(`create page`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `page`, `myPage`)).to.be.deep.equal([
        createPage,
        { name: `myPage`, path: undefined, pathname: undefined },
      ])
    })

    it(`should create with path`, () => {
      expect(parse(`create`, `page`, `myPage`, `ns1/ns2`)).to.be.deep.equal([
        createPage,
        { name: `myPage`, path: `ns1/ns2`, pathname: undefined },
      ])
    })

    it(`should create with pathname`, () => {
      expect(
        parse(`create`, `page`, `myPage`, `--pathname=/`)
      ).to.be.deep.equal([
        createPage,
        { name: `myPage`, path: undefined, pathname: `/` },
      ])
    })

    it(`should create with pathname shorthand`, () => {
      expect(parse(`create`, `page`, `myPage`, `-p`, `/`)).to.be.deep.equal([
        createPage,
        { name: `myPage`, path: undefined, pathname: `/` },
      ])
    })

    it(`should fail with non camelCase name`, () => {
      try {
        parse(`create`, `page`, `hyphen-page_`, `ns1/ns2`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`[name] of creating page/stream/nano/component should be camelCase`)
      }
    })
  })

  describe(`create stream`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `stream`, `myStream`)).to.be.deep.equal([
        createStream,
        { name: `myStream`, path: undefined },
      ])
    })

    it(`should create with path`, () => {
      expect(parse(`create`, `stream`, `myStream`, `ns1/ns2`)).to.be.deep.equal(
        [createStream, { name: `myStream`, path: `ns1/ns2` }]
      )
    })

    it(`should fail with non camelCase name`, () => {
      try {
        parse(`create`, `stream`, `under_score`, `ns1/ns2`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`[name] of creating page/stream/nano/component should be camelCase`)
      }
    })

  })

  describe(`create nano`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `nano`, `myNano`)).to.be.deep.equal([
        createNano,
        { name: `myNano`, path: undefined },
      ])
    })

    it(`should create with path`, () => {
      expect(parse(`create`, `nano`, `myNano`, `ns1/ns2`)).to.be.deep.equal([
        createNano,
        { name: `myNano`, path: `ns1/ns2` },
      ])
    })

    it(`should fail with non camelCase name`, () => {
      try {
        parse(`create`, `nano`, `hy-phen`, `ns1/ns2`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`[name] of creating page/stream/nano/component should be camelCase`)
      }
    })

  })

  describe(`create component`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `component`, `myComponent`)).to.be.deep.equal([
        createComponent,
        { name: `myComponent`, path: undefined },
      ])
    })

    it(`should create with path`, () => {
      expect(
        parse(`create`, `component`, `myComponent`, `ns1/ns2`)
      ).to.be.deep.equal([
        createComponent,
        { name: `myComponent`, path: `ns1/ns2` },
      ])
    })

    it(`should fail with non camelCase name`, () => {
      try {
        parse(`create`, `component`, `hy-phen`, `ns1/ns2`)
        throw new Error(`It did not throw an error`)
      } catch (e) {
        expect(e.message).to.equal(`[name] of creating page/stream/nano/component should be camelCase`)
      }
    })
  })

  describe(`upgrade`, () => {
    it(`should upgrade with no extra args`, () => {
      expect(parse(`upgrade`)).to.be.deep.equal([upgrade])
    })
  })
})
