import init from "./init.js"
describe(`init`, async () => {
  it(`should bootstrap a fully working project`, async () => {
    await init({
      name: `Tiden Example App`,
      tagline: `Use Tiden for a more flexible approach to building progressive web applications`,
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