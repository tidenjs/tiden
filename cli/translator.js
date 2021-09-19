import fs from 'fs/promises'
import {relative, resolve} from 'path'

export default async function translator(path, root = ``) {
  const appRoot = root || await searchAppRoot()
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

async function searchAppRoot() {
  let appRoot = ``
  const folders = resolve().split(`/`)

  if (folders.length > 0) {
    const promises = []
    const paths = []
    let path = ``

    for (let i = 0; i < folders.length; i++) {
      const childPath = i === folders.length - 1 ? folders[i] : folders[i] + `/`
      path += childPath
      paths.push(path)
      promises.push(fs.readdir(path))
    }

    const foldersInfo = await Promise.all(promises)

    for (let i = 0; i < foldersInfo.length; i++) {
      const maybeRoot = foldersInfo[i].indexOf(`manifest.json`) !== -1
      if (maybeRoot) {
        appRoot = paths[i]
      }
    }
  }

  return appRoot
}
