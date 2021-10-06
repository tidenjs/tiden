#!/usr/bin/env node

import parse from "./cli/parse.js"
import analyzePath from "./cli/analyzePath.js"
import addNamespace from "./cli/addNamespace.js"

import * as ops from "./ops.js"
import ide from "./ide.js"

async function start() {
  try {
    let command = parse(...process.argv.slice(2))

    // we don't want these commands to be run inside a folder that already has a root
    const noRoot = command[0] === `init`

    const { root, namespace } = await analyzePath(process.cwd(), { noRoot })

    // if cwd() is in a namespace, then implicitly add it to the command namespace
    const [name, ...args] = addNamespace(command, namespace)

    process.chdir(root)

    if (name === `ide`) {
      ide(...args)
    } else {
      ops[name](...args)
    }
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

start()
