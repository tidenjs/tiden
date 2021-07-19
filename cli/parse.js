import minimist from "minimist"

import { init, createStream, createPage, createNano } from "../ops.js"
import ide from "../ide.js"

export default function run(...slice) {
  const parsed = minimist(slice, {
    alias: {
      d: `description`,
      p: `pathname`,
    },
  })

  const [verb, arg1, arg2, arg3] = parsed._
  const nargs = { ...parsed }
  delete nargs._

  switch (verb) {
    case `start`: {
      return [ide, {}]
      break
    }
    case `init`: {
      const name = arg1

      if (!name) {
        throw new Error(
          `Usage: init <name> [--description="some description"] [-d "some description"]`
        )
      }

      return [init, { name, description: nargs.description }]
    }
    case `create`: {
      // Usage 1: tiden create stream myStream
      // Usage 2: tiden create stream ns/ns2/ns3/nsX myStream

      const noun = arg1
      const name = arg2
      const path = arg3

      if (!noun || !name) {
        throw new Error(
          `Usage: create <thing> <name> [path] (where thing can be 'stream', 'page' or 'nano')`
        )
      }

      return create(noun, name, path, parsed)
    }
    case `help`: {
      return showHelp()
    }
    default: {
      return showHelp()
    }
  }
}

function showHelp() {
  console.log(`Usage:

    init <name> [--description="some description"] [-d "some description"]
    start
    create stream <name> [path]
    create nano <name> [path]
    create page <name> [path] [--pathname="/custom/url"] [-pn "/custom/url"]
  `)
}

function create(noun, name, path, extras) {
  if (noun === `stream`) {
    return [createStream, { path, name }]
  } else if (noun === `page`) {
    return [createPage, { path, name, pathname: extras.pathname }]
  } else if (noun === `nano`) {
    return [createNano, { path, name }]
  } else {
    throw new Error(`Bad noun '${noun}'. Available: 'stream', 'page' or 'nano'`)
  }
}
