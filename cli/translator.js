import {stat} from 'fs/promises'
import {relative, resolve} from 'path'

export default async function translator(rawPath) {
  const path = rawPath ?? `.`
  const appRoot = await searchRootFolder(path)
  if (!appRoot) {
    throw Error(`Cannot translate using ${rawPath} folder`)
  }

  const rootToPath = relative(appRoot, path)
  const translatedPath = removeAppFromPath(rootToPath)

  return translatedPath
}

// translate 
// - app/a/b/c => a/b/c
// - app => ''
function removeAppFromPath(path) {
  const index = Math.min(path?.length, 4)
  return path?.startsWith(`app`) ? path.substr(index) : path
}

async function searchRootFolder(path) {
  if (path === `/`) {
    return false
  }

  const hasManifest = !!(await stat(`${path}/manifest.json`).catch(e => false))

  if (hasManifest) {
    return path
  } else {
    return await searchRootFolder(resolve(path, `..`))
  }
}
