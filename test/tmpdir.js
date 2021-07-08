import { mkdtemp } from "fs/promises"
import os from "os"
import path from "path"

export default async function tmpdir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), `tiden-`))
  process.chdir(dir)

  return dir
}
