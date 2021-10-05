import { expect } from "chai"
import addNamespace from "./addNamespace.js"

describe(`cli/addNamespace`, () => {
  describe(`command args is UNSET`, () => {
    let name, args

    before(() => {
      ;[name, args] = addNamespace([`init`])
    })

    it(`should not set args`, () => {
      expect(args).to.be.undefined
    })
  })

  describe(`command namespace is UNSET`, () => {
    let name, args

    before(() => {
      ;[name, args] = addNamespace([`init`, {}])
    })

    it(`should not set namespace`, () => {
      expect(args.hasOwnProperty(`namespace`)).to.be.false
    })
  })

  describe(`command namespace is '' and path namespace is ''`, () => {
    const inArgs = { namespace: `` }
    let name, args, newCommand
    const command = [`createNano`, inArgs]
    before(() => {
      newCommand = addNamespace(command, ``)
      ;[name, args] = newCommand
    })

    it(`return whatever came in`, () => {
      expect(name).to.be.equal(`createNano`)
      expect(args.namespace).to.be.equal(``)
    })

    it(`should return a new object`, () => {
      expect(newCommand).not.to.be.equal(command)
      expect(args).not.to.be.equal(inArgs)
    })
  })

  describe(`command namespace is 'east/asia' and path namespace is ''`, () => {
    let name, args

    before(() => {
      ;[name, args] = addNamespace(
        [`createNano`, { namespace: `east/asia` }],
        ``
      )
    })

    it(`should set namespace to 'east/asia'`, () => {
      expect(args.namespace).to.be.equal(`east/asia`)
    })
  })

  describe(`command namespace is '' and path namespace is 'east/asia'`, () => {
    let name, args

    before(() => {
      ;[name, args] = addNamespace(
        [`createNano`, { namespace: `` }],
        `east/asia`
      )
    })

    it(`should set namespace to 'east/asia'`, () => {
      expect(args.namespace).to.be.equal(`east/asia`)
    })
  })

  describe(`command namespace is 'philippines' and path namespace is 'east/asia'`, () => {
    let name, args

    before(() => {
      ;[name, args] = addNamespace(
        [`createNano`, { namespace: `philippines` }],
        `east/asia`
      )
    })

    it(`should set namespace to 'east/asia/philippines'`, () => {
      expect(args.namespace).to.be.equal(`east/asia/philippines`)
    })
  })
})
