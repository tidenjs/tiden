import mkdirp from "../lib/mkdirp.js"

export default async function createStream({ path, name }) {
  await mkdirp(path)


}
