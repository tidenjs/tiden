import fs from 'fs/promises'

export default async function translator(path) {
  const cwd = process.cwd()
  const rootPath = await searchRootFolder(cwd)
  if (!rootPath) {
    throw Error(`Cannot translate using ${cwd} folder`)
  }

  const relativeRoot = removeAppFromPath(cwd.substr(rootPath.length))
  const isAppPath = path?.startsWith(`app`)
  const resolvePath = isAppPath 
    ? removeAppFromPath(path) 
    : path ?? ``

  const translatedPath = isAppPath
    ? resolvePath
    : `${relativeRoot ? relativeRoot + `/` : ``}` + resolvePath

  return translatedPath
}

// translate app/a/b/c => a/b/c
function removeAppFromPath(path) {
  return path
    .split(`/`)
    .filter(dir => dir.length > 0 && dir !== `app`)
    .join(`/`)
}

async function searchRootFolder(cwd) {
  let rootPath = ``
  const folders = cwd.split(`/`)

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
        rootPath = paths[i]
      }
    }
  }

  return rootPath
}
