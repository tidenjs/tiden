import create from "./cli/create.js"
import init from "./cli/init.js"

const [_node, _file, verb, ...args] = process.argv

if (verb === `create`) {
  create(noun, ...args)
} else if (verb === `init`) {
  init()
} else {
  throw new Error(`No such verb '${verb}'`)
}
