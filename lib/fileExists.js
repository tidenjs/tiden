import { resolve } from "path"
import fs from "fs/promises"

export default async function fileExists(path) {
  try {
    const stat = await fs.stat(path)
    return stat.isFile()
  } catch (e) {
    if (e.code === `ENOENT`) {
      return false
    } else {
      throw e
    }
  }
}
