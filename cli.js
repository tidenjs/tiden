#!/usr/bin/env node

import init from "./cli/init.js"

const [_node, _file, verb, ...args] = process.argv

if (verb === `init`) {
  init()
} else if (verb === `help`) {
  showHelp()
} else {
  showHelp()
}

function showHelp() {
  console.log(`Usage:

  init - Bootstraps a new project in current directory`)
}
