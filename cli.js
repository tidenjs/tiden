#!/usr/bin/env node

import parse from "./cli/parse.js"

try {
  const [cmd, ...args] = parse(...process.argv.slice(2))
  cmd(...args)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
