#!/usr/bin/env node

import parse from "./cli/parse.js"

try {
  const [cmd, ...args] = parse(...process.argv.slice(2))
  cmd(...args)
} catch (e) {

  if (e.message.includes('spawn watchman')) {
    console.log('Please check if watchman is installed properly, before using dev-server!')
  } else {
    console.error(e.message)
  }

  process.exit(1)
}
