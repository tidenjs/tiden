/* Import the puppeteer and expect functionality of chai library for configuraing the Puppeteer */
import puppeteer from "puppeteer"
import { expect } from "chai"

/* configurable options or object for puppeteer */
const opts = {
  headless: true,
  //slowMo: 100,
  timeout: 0,
  // args: ['--start-maximized', '--window-size=1920,1040']
}

before(async () => {
  global.expect = expect
  global.browser = await puppeteer.launch(opts)
})

after(() => {
  browser.close()
})
