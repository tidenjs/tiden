import { resolve } from "path"

export default async function fileExists(path) {
  try {
    const stat = await fs.stat(path)
    return stat.isFile()
  } catch (e) {
    return false
  }
}
