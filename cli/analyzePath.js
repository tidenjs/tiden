import { stat } from "fs/promises"
import { relative, resolve, sep } from "path"
import fileExists from "../lib/fileExists.js"

export default async function analyzePath(path, { noRoot = false } = {}) {
  if (!path) {
    throw new Error(`Path argument is obligatory.`)
  }

  const absolutePath = resolve(path)

  const root = await searchRootFolder(path)

  if (!root) {
    if (!noRoot) {
      throw new Error(`Cannot analyze '${path}' folder`)
    }
  } else {
    if (noRoot) {
      throw new Error(`This path already has a Tiden project.`)
    }
  }

  const namespace = noRoot ? `` : scrub(relative(root + `/app`, path))

  return { namespace, root: noRoot ? `.` : relative(absolutePath, root) || `.` }
}

// .. => ``
function scrub(path) {
  return path
    .replace(/^\.+/, ``)
    .replace(new RegExp(`${sep}components(${sep}.*)?$`), ``)
    .replace(new RegExp(`${sep}pages(${sep}.*)?$`), ``)
    .replace(new RegExp(`${sep}streams(${sep}.*)?$`), ``)
    .replace(new RegExp(`${sep}nanos(${sep}.*)?$`), ``)
}

async function searchRootFolder(path) {
  if (path === `/`) {
    return false
  }

  const hasManifest = await fileExists(`${path}/manifest.json`)

  if (hasManifest) {
    return path
  } else {
    return await searchRootFolder(resolve(path, `..`))
  }
}
