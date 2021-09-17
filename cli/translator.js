import fs from 'fs/promises'

export default async function translator(path) {
  const cwd = process.cwd()
  const rootPath = await searchRootFolder(cwd)

  if (!rootPath) {
    throw Error(`Cannot translate using ${cwd} folder`)
  }

  const relativeRoot = cwd
    .substr(rootPath.length)
    .split(`/`)
    .filter(dir => dir.length > 0 && dir !== `app`)
    .join(`/`)

  const isAppPath = path?.startsWith(`app`)
  const resolvePath = isAppPath
    ? path.substr(3).split(`/`).filter(dir => dir.length > 0).join(`/`)
    : path

  const translatedPath = resolvePath ? `${relativeRoot}/${resolvePath}` : relativeRoot


  console.log(translatedPath)

  return translatedPath
}

async function searchRootFolder(cwd) {
  let rootPath = ``
  const folders = cwd.split('/')

  if (folders.length > 0) {
    const promises = []
    const paths = []
    let path = ''

    for (let i = 0; i < folders.length; i++) {
      const childPath = i === folders.length - 1 ? folders[i] : folders[i] + `/`
      path += childPath
      paths.push(path)
      promises.push(fs.readdir(path))
    }

    const foldersInfo = await Promise.all(promises)

    for (let i = 0; i < foldersInfo.length; i++) {
      const maybeRoot = foldersInfo[i].indexOf(`manifest.json`)
      if (maybeRoot) {
        rootPath = paths[i]
      }
    }
  }

  return rootPath
}
