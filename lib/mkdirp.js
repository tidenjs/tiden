import fs from "fs/promises"
import { resolve } from "path"

export default async function mkdirp(path) {
  const parts = resolve(path).split(/(?!\\)\//) // split on slash

  let dir = ``

  while (parts.length > 0) {
    dir = `${dir}/${parts.shift()}`

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
