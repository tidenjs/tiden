import { init } from "../../ops.js"

describe(`init`, async () => {
  it(`should bootstrap a fully working project`, async () => {
    await init({
      name: `Tiden Example App`,
      description: `Use Tiden for a more flexible approach to building progressive web applications`,
      isTest: true,
    })

    await page.goto(`http://localhost:1107`)
    expect(await page.evaluate(() => document.title)).to.equal(
      `Tiden Example App`
    )
    expect(await page.evaluate(() => document.title)).to.equal(
      `Tiden Example App`
    )
  })
})
