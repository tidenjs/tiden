import fs from "fs/promises"

export default async function mkdirp(path) {
  const parts = path.split(/(?!\\)\//) // split on slash

  let dir = `.`

  while (parts.length > 0) {
    dir = `${dir}/${parths.shift()}`

    if (!(await dirExists(dir))) {
      await fs.mkdir(dir)
    }
  }
}

async function dirExists(path) {
  try {
    const stat = await fs.stat(path)
    return stat.isDirectory()
  } catch (e) {
    return false
  }
}
