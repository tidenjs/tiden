import minimist from "minimist"

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
      return [`ide`, {}]
      break
    }
    case `init`: {
      const name = arg1

      if (!name) {
        throw new Error(
          `Usage: init <name> [--description="some description"] [-d "some description"]`
        )
      }

      return [`init`, { name, description: nargs.description }]
    }
    case `upgrade`: {
      return [`upgrade`]
    }
    case `create`: {
      // Usage 1: tiden create stream myStream
      // Usage 2: tiden create stream ns/ns2/ns3/nsX myStream

      const noun = arg1
      const name = arg2
      const namespace = arg3

      if (!noun || !name) {
        throw new Error(
          `Usage: create <thing> <name> [namespace] (where thing can be 'stream', 'component', 'page' or 'nano')`
        )
      }

      return create(noun, name, namespace, parsed)
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
    upgrade
    start
    create stream <name> [namespace]
    create nano <name> [namespace]
    create page <name> [namespace] [--pathname="/custom/url"] [-pn "/custom/url"]
    create component <name> [namespace]
  `)
}

function create(noun, name, namespace, extras) {
  namespace ||= ``

  if (noun === `stream`) {
    return [`createStream`, { namespace, name }]
  } else if (noun === `page`) {
    return [`createPage`, { namespace, name, pathname: extras.pathname }]
  } else if (noun === `nano`) {
    return [`createNano`, { namespace, name }]
  } else if (noun === `component`) {
    return [`createComponent`, { namespace, name }]
  } else {
    throw new Error(
      `Bad noun '${noun}'. Available: 'stream', 'component', 'page' or 'nano'`
    )
  }
}
