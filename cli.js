#!/usr/bin/env node

import minimist from "minimist"

import { init, createStream, createPage, createNano } from "./ops.js"
import ide from "./ide.js"

const parsed = minimist(process.argv.slice(2), {
  alias: {
    d: `description`,
  },
})

const [verb, arg1, arg2, arg3] = parsed._

switch (verb) {
  case `start`: {
    ide()
    break
  }
  case `init`: {
    const name = arg1

    if (!name) {
      console.error(
        `Usage: init <name> [--description="some description"] [-d "some description"]`
      )
      process.exit(1)
    }

    init({ name, ...parsed })
    break
  }
  case `create`: {
    // Usage 1: tiden create stream myStream
    // Usage 2: tiden create stream ns/ns2/ns3/nsX myStream

    const noun = arg1
    const name = arg2
    const path = arg3

    if (!noun || !name) {
      console.error(
        `Usage: create <thing> <name> [path] (where thing can be 'stream', 'page' or 'nano')`
      )
      process.exit(2)
    }

    create(noun, name, path)
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
  create <stream/nano/page> <name> [path]
`)
}

async function create(noun, name, path) {
  if (noun === `stream`) {
    await createStream({ path, name })
  } else if (noun === `page`) {
    await createPage({ path, name })
  } else if (noun === `nano`) {
    await createNano({ path, name })
  } else {
    console.error(`Bad noun '${noun}'. Available: 'stream', 'page' or 'nano'`)
    process.exit(3)
  }
}
