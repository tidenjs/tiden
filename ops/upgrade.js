import fs from "fs/promises"

export default async function upgrade() {
  const version = `0.5.0`
  let index = await fs.readFile(`index.html`, `utf-8`)
  index = index.replace(
    new RegExp(`(https://cdn.jsdelivr.net/npm/tiden@)[^/]+(/init.js)`),
    `$1${version}$2`
  )
  await fs.writeFile(`index.html`, index)
}
