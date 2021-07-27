/* Import the puppeteer and expect functionality of chai library for configuraing the Puppeteer */

import { expect } from "chai"
import { spawn } from "child_process"
import cors from "cors"
import express from "express"
import path from "path"
import puppeteer from "puppeteer"

import tmpdir from "../tmpdir.js"

const debug = false
const showOutput = true

/* configurable options or object for puppeteer */
const opts = {
  headless: !debug,
  devtools: debug,
  //slowMo: 100,
  timeout: 0,
  args: ["--window-size=1920,1040", "--window-position=2000,0"],
  //dumpio: true,
}

let tidenApp
before(async () => {
  global.expect = expect
  global.browser = await puppeteer.launch(opts)
  global.pageUsed = false

  tidenApp = express()
  tidenApp.use(cors())
  tidenApp.use(express.static(path.resolve(`.`)))
  await new Promise((res) => {
    tidenApp.server = tidenApp.listen(1105, res)
  })
})

let app
beforeEach(async function () {
  const dir = await tmpdir()
  if (global.pageUsed) {
    global.page = await browser.newPage()
  } else {
    global.page = (await browser.pages())[0]
    global.pageUsed = true
  }

  if (showOutput) {
    global.page.on("console", async (msg) => {
      const args = await Promise.all(msg.args().map((arg) => arg.jsonValue()))
      if (msg._type !== `info`) {
        console[msg._type](...args)
      }
    })
  }

  app = express()
  const port = 1107
  app.use(express.static(`.`))
  app.get(`*`, (req, res) => {
    res.sendFile(`${dir}/index.html`)
  })
  await new Promise((res) => {
    app.server = app.listen(port, res)
  })

  const title = this.currentTest.title
  page.waitForNavigation().then(() => {
    setTimeout(() => {
      page.evaluate((newTitle) => {
        document.title = newTitle
      }, title)
    }, 300)
  })
})

afterEach(async () => {
  //await new Promise((res) => {
  app.server.close()
  //})
  //console.log(`closed it!`)
})

after(async () => {
  if (!debug) {
    browser.close()
  }
  tidenApp.server.close()
})

export default function cmd(literals, ...args) {
  let str = literals[0]
  try {
    args.forEach((arg, i) => {
      str += `"${arg.replace(/"/g, `\\"`)}"${literals[i + 1]}`
    })
  } catch (e) {
    throw e
  }

  return async function* () {
    let res, err, p
    p = new Promise((r, e) => {
      res = r
      err = e
    })

    const ds = spawn(str, { shell: true })

    try {
      ds.stdout.on(`data`, (data) => res({ data, isError: false }))
      ds.stderr.on(`data`, (data) => res({ data, isError: true }))
      ds.on(`exit`, () => res({}))
    } catch (e) {
      console.error(
        `There was an error setting up data transfer to subcommand: `,
        e
      )
    }

    try {
      while (ds.connected) {
        p = new Promise((r, e) => {
          res = r
          err = e
        })

        const packet = await p
        if (packet.data !== undefined) {
          return yield packet
        } else {
          break
        }
      }
    } finally {
      console.log(`killing of the server`)
      try {
        ds.kill(`SIGKILL`)
        console.log(`killing done`)
      } catch (e) {
        console.error(`Could not kill hotserve: `, e)
      }
    }

    return ds.exitCode
  }
}

global.cmd = cmd
