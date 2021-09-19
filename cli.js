#!/usr/bin/env node

import parse from "./cli/parse.js"
import translator from "./cli/translator.js"

try {
  const [cmd, ...args] = parse(...process.argv.slice(2))

  translator(args[0]?.path).then(resolvePath => {
    args[0].path = resolvePath
    cmd(args)
  })

} catch (e) {
  process.exit(1)
}
