#!/usr/bin/env node

import parse from "./cli/parse.js"
import translator from "./cli/translator.js"

try {
  const [cmd, path, ...args] = parse(...process.argv.slice(2))
  const resolvePath = translator(path)
  cmd(path, ...args)

} catch (e) {
  process.exit(1)
}
