import hotserve from "hotserve"
import express from "express"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default function ide() {
  const app = express()
  const project = express()

  hotserve({
    dir: `.`,
    pattern: `*.{js,html}`,
    app: project,
  })

  app.use(`/project`, project)
  app.use(express.static(`${__dirname}/ide/`))
  app.use(`*`, express.static(`${__dirname}/ide/index.html`))

  app.listen(1100)

  console.log()
  console.log(`   * * * * * * * * * *`)
  console.log(`   *                 *`)
  console.log(`   *  ■  T i d e n   *`)
  console.log(`   *                 *`)
  console.log(`   * * * * * * * * * *`)
  console.log()
  console.log(`   Server started!`)
  console.log(`   http://localhost:1100`)
}
