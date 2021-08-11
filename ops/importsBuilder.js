export default function importsBuilder(initial) {
  let imports = {}

  // format of imports is like this:
  //
  // {
  //   "some/path.js": {
  //      namedArgument: Set[ `customNamedArgument` ],
  //      default: Set[ `name` ]
  //   }
  // }

  function add(newImports) {
    for (const file of Object.keys(newImports)) {
      if (!imports.hasOwnProperty(file)) {
        imports[file] = {}
      }

      for (const key of Object.keys(newImports[file])) {
        if (!imports[file].hasOwnProperty(key)) {
          imports[file][key] = new Set()
        }

        for (const value of newImports[file][key]) {
          imports[file][key].add(value)
        }
      }
    }
  }

  function sort(what) {
    const globals = []
    const locals = []

    const files = Object.keys(what)

    for (const file of files) {
      if (file.startsWith(`.`)) {
        const level =
          1000 +
          [...file.matchAll(`[^.]/`)].length -
          [...file.matchAll(`../`)].length
        if (!locals[level]) {
          locals[level] = []
        }
        locals[level].push([file, what[file]])
      } else {
        globals.push([file, what[file]])
      }
    }
    return [
      globals.sort((a, b) => a[0].localeCompare(b[0])),
      ...locals
        .filter((it) => !!it)
        .map((level) => level.sort((a, b) => a[0].localeCompare(b[0]))),
    ]
  }

  function format(file, def) {
    let shouldSkip = true
    let namedDefault
    let namedExports = []

    if (def.default) {
      const items = [...def.default]
      if (items.length > 0) {
        for (const it of items) {
          shouldSkip = false

          if (it === ``) {
            // this is just to mark it as necessary to import even though there is nothing named
            // i.e.: `import "x"`
          } else {
            if (!namedDefault) {
              namedDefault = it
            } else {
              // default can be exported many times using aliases, so put it as namedExport
              namedExports.push(`default as ${it}`)
            }
          }
        }
      }
    }

    for (const exp of Object.keys(def)) {
      if (exp !== `default`) {
        shouldSkip = false
        // managed above
        for (const item of def[exp]) {
          if (item === exp) {
            namedExports.push(item)
          } else {
            namedExports.push(`${exp} as ${item}`)
          }
        }
      }
    }

    if (!shouldSkip) {
      const parts = []
      if (namedDefault) {
        parts.push(namedDefault)
      }

      if (namedExports.length > 0) {
        parts.push(`{ ${namedExports.join(`, `)} }`)
      }

      return `import${
        parts.length === 0 ? `` : ` ${parts.join(`, `)} from`
      } "${file}"`
    }
  }

  function toString() {
    return sort(imports)
      .map((group) =>
        group
          .map((it) => format(...it))
          .filter((it) => !!it)
          .join(`\n`)
      )
      .join(`\n\n`)
  }

  if (initial) {
    add(initial)
  }

  return { add, toString }
}
