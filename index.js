
const [_node, _file, verb, noun, name] = process.argv

if (!verb !== `create`) {
  throw new Error(`No such verb '${verb}'`)
}

if ([`component`].includes(noun)) {
  throw new Error(`No such noun '${noun}'`)
}


