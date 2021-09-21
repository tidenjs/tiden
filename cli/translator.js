import {stat} from 'fs/promises'
import {relative, resolve} from 'path'

export default async function translator(path, root = ``) {
  const appRoot = root || await searchRootFolder(resolve())
  const absolutePath = resolve()
  if (!appRoot) {
    const cwd = relative(absolutePath, path)
    throw Error(`Cannot translate using ${cwd} folder`)
  }

  const relativeRoot = removeAppFromPath(relative(appRoot, absolutePath))
  const isAppPath = path?.startsWith(`app`)
  const resolvePath = isAppPath 
    ? removeAppFromPath(path) 
    : path ?? ``

  const translatedPath = isAppPath
    ? resolvePath
    : `${relativeRoot ? relativeRoot + `/` : ``}` + resolvePath

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
  const hasManifest = !!(await stat(`${path}/manifest.json`).catch(e => false))

  if (path === `/`) {
    return false
  }

  if (hasManifest) {
    return path
  } else {
    return await searchRootFolder(resolve(path, `..`))
  }
}
