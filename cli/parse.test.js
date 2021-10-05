import { expect } from "chai"
import o from "outdent"

import ide from "../ide.js"
import parse from "./parse.js"

describe(`cli`, () => {
  describe(`init`, () => {
    it(`should pass name of app`, () => {
      expect(parse(`init`, `myApp`)).to.be.deep.equal([
        `init`,
        { name: `myApp`, description: undefined },
      ])
    })

    it(`should pass description`, () => {
      expect(
        parse(`init`, `myApp`, `--description=hey it's a thing`)
      ).to.be.deep.equal([
        `init`,
        { name: `myApp`, description: `hey it's a thing` },
      ])
    })

    it(`should pass shorthand description`, () => {
      expect(parse(`init`, `myApp`, `-d`, `hey it's a thing`)).to.be.deep.equal(
        [`init`, { name: `myApp`, description: `hey it's a thing` }]
      )
    })
  })

  describe(`start`, () => {
    it(`should start ide`, () => {
      expect(parse(`start`)).to.be.deep.equal([`ide`, {}])
    })
  })

  describe(`create page`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `page`, `myPage`)).to.be.deep.equal([
        `createPage`,
        { name: `myPage`, namespace: ``, pathname: undefined },
      ])
    })

    it(`should create with path`, () => {
      expect(parse(`create`, `page`, `myPage`, `ns1/ns2`)).to.be.deep.equal([
        `createPage`,
        { name: `myPage`, namespace: `ns1/ns2`, pathname: undefined },
      ])
    })

    it(`should create with pathname`, () => {
      expect(
        parse(`create`, `page`, `myPage`, `--pathname=/`)
      ).to.be.deep.equal([
        `createPage`,
        { name: `myPage`, namespace: ``, pathname: `/` },
      ])
    })

    it(`should create with pathname shorthand`, () => {
      expect(parse(`create`, `page`, `myPage`, `-p`, `/`)).to.be.deep.equal([
        `createPage`,
        { name: `myPage`, namespace: ``, pathname: `/` },
      ])
    })
  })

  describe(`create stream`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `stream`, `myStream`)).to.be.deep.equal([
        `createStream`,
        { name: `myStream`, namespace: `` },
      ])
    })

    it(`should create with namespace`, () => {
      expect(parse(`create`, `stream`, `myStream`, `ns1/ns2`)).to.be.deep.equal(
        [`createStream`, { name: `myStream`, namespace: `ns1/ns2` }]
      )
    })
  })

  describe(`create nano`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `nano`, `myNano`)).to.be.deep.equal([
        `createNano`,
        { name: `myNano`, namespace: `` },
      ])
    })

    it(`should create with namespace`, () => {
      expect(parse(`create`, `nano`, `myNano`, `ns1/ns2`)).to.be.deep.equal([
        `createNano`,
        { name: `myNano`, namespace: `ns1/ns2` },
      ])
    })
  })

  describe(`create component`, () => {
    it(`should create with no extra args`, () => {
      expect(parse(`create`, `component`, `myComponent`)).to.be.deep.equal([
        `createComponent`,
        { name: `myComponent`, namespace: `` },
      ])
    })

    it(`should create with namespace`, () => {
      expect(
        parse(`create`, `component`, `myComponent`, `ns1/ns2`)
      ).to.be.deep.equal([
        `createComponent`,
        { name: `myComponent`, namespace: `ns1/ns2` },
      ])
    })
  })

  describe(`upgrade`, () => {
    it(`should upgrade with no extra args`, () => {
      expect(parse(`upgrade`)).to.be.deep.equal([`upgrade`])
    })
  })
})
