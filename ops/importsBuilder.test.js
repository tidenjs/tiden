import { expect } from "chai"
import o from "outdent"

import importBuilder from "./importsBuilder.js"

describe(`importBuilder`, () => {
  it(`should NOT include empty import`, async () => {
    const it = importBuilder({ royalDucks: { default: [] } })

    expect(it.toString()).to.match(/^$/)
  })

  it(`should stringify unnamed default`, async () => {
    const it = importBuilder({ royalDucks: { default: [``] } })

    expect(it.toString()).to.match(/import "royalDucks"/)
  })

  it(`should stringify NAMED default`, async () => {
    const it = importBuilder({ royalDucks: { default: [`ducks`] } })

    expect(it.toString()).to.match(/import ducks from "royalDucks"/)
  })

  it(`should stringify unnamed, and one named defaults`, async () => {
    const it = importBuilder({ royalDucks: { default: [``, `ducks`] } })

    expect(it.toString()).to.match(/import ducks from "royalDucks"/)
  })

  it(`should stringify multiple named defaults`, async () => {
    const it = importBuilder({
      royalDucks: { default: [`ducks`, `ducksAgain`] },
    })

    expect(it.toString()).to.match(
      /import ducks, { default as ducksAgain } from "royalDucks"/
    )
  })

  it(`should stringify named imports`, async () => {
    const it = importBuilder({
      birds: { ducks: [`ducks`], geese: [`geese`] },
    })

    expect(it.toString()).to.match(/import { ducks, geese } from "birds"/)
  })

  it(`should stringify aliased named imports`, async () => {
    const it = importBuilder({
      birds: { ducks: [`donald`], geese: [`nils`] },
    })

    expect(it.toString()).to.match(
      /import { ducks as donald, geese as nils } from "birds"/
    )
  })

  it(`should stringify everything together`, async () => {
    const it = importBuilder({
      birds: {
        default: [`def1`, `def2`],
        ducks: [`ducks`, `donald`],
        geese: [`geese`, `nils`],
      },
    })

    expect(it.toString()).to.match(
      /import def1, { default as def2, ducks, ducks as donald, geese, geese as nils } from "birds"/
    )
  })

  it(`should sort globals first, then ascending alphanumeric`, async () => {
    const it = importBuilder({
      abc: { default: [``] },
      "../../a": { default: [``] },
      def: { default: [``] },
      "../../b": { default: [``] },
      gef: { default: [``] },
      "./c": { default: [``] },
      "./b": { default: [``] },
      "./a": { default: [``] },
      "../onelevel": { default: [``] },
    })

    expect(it.toString()).to.equal(
      o`
        import "abc"
        import "def"
        import "gef"

        import "../../a"
        import "../../b"

        import "../onelevel"

        import "./a"
        import "./b"
        import "./c"
      `
    )
  })
})
