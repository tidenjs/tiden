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

    await page.waitForFunction(() => {
      const el = document.querySelector(`x-view-home`)

      return el && el.shadowRoot
    })

    expect(
      await page.evaluate(
        () => document.querySelector(`x-view-home`).shadowRoot.innerHTML
      )
    ).to.match(/Hurray! You're here./)
  })
})
