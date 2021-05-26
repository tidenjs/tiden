#!/usr/bin/env node

import init from "./cli/init.js"

import minimist from "minimist"

const parsed = minimist(process.argv.slice(2), {
  alias: {
    d: `description`,
  },
})

switch (parsed._[0]) {
  case `init`: {
    const [name] = parsed._[1]

    if (!name) {
      throw new Error(
        `Usage: init <name> [--description="some description"] [-d "some description"]`
      )
    }

    init({ name, ...parsed })
    break
  }
  case `help`: {
    showHelp()
    break
  }
  default: {
    showHelp()
    break
  }
}

function showHelp() {
  console.log(`Usage:

  init <name> [--description="some description"] [-d "some description"]
`)
}
