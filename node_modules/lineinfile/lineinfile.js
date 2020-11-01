// ansible inspired function to ensure a specified state in file
//
// path: the path to the file to ensure state for
// regex: a regex for searching for line, if unset will use literal 'line' matching
// line: What should be printed instead of regex (or a new line)
// state: [absent/present] whether to remove the line or ensure it is set
// insertBefore: Either a regex of a line to insert before, or the string `BOF` will add it on start. If set has precedence over insertAfter
// insertAfter: Either a regex of a lin eto insert after, or the string `EOF` will add it to bottom
import fs from "fs/promises"

export default async function lineInFile({
  path,
  regex,
  line: lineToAdd,
  state = `present`,
  insertBefore = null, // can be `BOF` (beginning of file) or a regex
  insertAfter = null, // can be `EOF` (end of file) or a regex
}) {
  await mkdirp(path)

  let file
  try {
    file = await fs.open(path, "r+")
  } catch (e) {
    if (e.code === `ENOENT`) {
      if (state === `absent`) {
        // nothing to do
        return
      } else {
        // create it
        file = await fs.open(path, `w+`)
      }
    } else {
      throw e
    }
  }

  const lines = (await file.readFile({ encoding: `utf8` })).split(`\n`)
  file.close()

  const resultLines = []
  let changed = false

  if (state === `absent`) {
    for (const line of lines) {
      if (regex) {
        if (!line.match(regex)) {
          resultLines.push(line)
        } else {
          changed = true
        }
      } else {
        if (line != lineToAdd) {
          resultLines.push(line)
        } else {
          changed = true
        }
      }
    }
  } else if (state === `replace`) {
    let found = false

    for (const line of lines) {
      if (regex) {
        if (line.match(regex)) {
          if (!found) {
            resultLines.push(lineToAdd)
            found = true

            if (line !== lineToAdd) {
              changed = true
            }
          } else {
            changed = true
          }
        } else {
          resultLines.push(line)
        }
      } else {
        if (line === lineToAdd) {
          found = true
        }
        resultLines.push(line)
      }
    }
  } else if (state === `present`) {
    let found = false

    for (const line of lines) {
      if (regex) {
        if (line.match(regex)) {
          found = true
        }
      } else {
        if (line === lineToAdd) {
          found = true
        }
      }
      resultLines.push(line)
    }

    if (!found) {
      // it's not present anywhere in file, so we need to add it

      if (insertBefore) {
        if (insertBefore === `BOF`) {
          resultLines.unshift(lineToAdd)
        } else {
          const index = resultLines.findIndex((it) => it.match(insertBefore))
          if (index <= 0) {
            resultLines.unshift(lineToAdd)
          } else {
            resultLines.splice(index, 0, lineToAdd)
          }
        }
      } else if (insertAfter) {
        if (insertAfter === `EOF`) {
          resultLines.push(lineToAdd)
        } else {
          let index = -1

          for (let i = resultLines.length - 1; i >= 0; i--) {
            if (resultLines[i].match(insertAfter)) {
              index = i
              break
            }
          }

          if (index === -1) {
            resultLines.push(lineToAdd)
          } else {
            resultLines.splice(index + 1, 0, lineToAdd)
          }
        }
      } else {
        resultLines.push(lineToAdd)
      }
      changed = true
    }
  }

  if (changed) {
    await fs.writeFile(path, resultLines.join(`\n`))
  }
}

async function mkdirp(path) {
  const dirs = path.split(`/`)
  const filename = dirs.pop()

  if (dirs.length > 0) {
    await fs.mkdir(dirs.join(`/`), { recursive: true })
  }
}

//lineInFile({
//  path: `./it`,
//  line: `it works`,
//  insertAfter: `import`,
//})
