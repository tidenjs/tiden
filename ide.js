import hotserve from "hotserve"
import express from "express"

export default function ide() {
  const app = express()
  hotserve({ dir: `.`, mainHtml: `index.html`, pattern: `*.{js,html}`, app })
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
