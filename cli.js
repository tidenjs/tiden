#!/usr/bin/env node

import parse from "./cli/parse.js"
import translator from "./cli/translator.js"

async function start () {
  try {
    const [cmd, ...args] = parse(...process.argv.slice(2))
    const resolvePath = await translator(args[0]?.path)
    args[0].path = resolvePath
    cmd(...args)

  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

start()
