import fs from "fs/promises"
import replaceAllTidenUrls from "./upgrade/replaceAllTidenUrls.js"
import getOldVersion from "./upgrade/getOldVersion.js"
import version from "../version.js"

const importmap =
  /<\s*script\s+type\s*=\s*"importmap"\s*>(?<json>.*?)<\/\s*script\s*>/gs

export default async function upgrade() {
  let index = await fs.readFile(`index.html`, `utf-8`)

  const oldVersion = getOldVersion(index)
  console.log(`Upgrading from ${oldVersion.all} to ${version}.`)

  index = await replaceAllTidenUrls(index, { version })

  // pre version 0.7 used to inject the importmap needed by Tiden, however 0.7 and forwards all import maps are in index.html
  if (oldVersion.major === 0 && oldVersion.minor < 7) {
    // Remove the comment about importmaps
    index = index.replace(/<!-- add your own importmaps here.*?-->/, ``)

    // remove any other pre-existing importmaps
    index = index.replace(importmap, ``)

    index = index.replace(
      /<body>/,
      `
<script type="importmap">
  {
    imports: {
      "tiden": "https://cdn.jsdelivr.net/npm/tiden@${version}/tiden.js",
      "tiden/": "https://cdn.jsdelivr.net/npm/tiden@${version}/",
      "lit-html": "https://cdn.jsdelivr.net/npm/lit-html@1.4.1/lit-html.js",
      "lit-html/": "https://cdn.jsdelivr.net/npm/lit-html@1.4.1/",
      "redux-saga": "https://cdn.jsdelivr.net/npm/redux-saga@^1.1.3/dist/redux-saga-core.esmodules-browsers.js?module",
      "redux-saga/effects.js": "https://cdn.jsdelivr.net/npm/redux-saga@^1.1.3/dist/redux-saga-effects.esmodules-browsers.js?module",
      "redux": "https://cdn.jsdelivr.net/npm/redux@^4.0.4/es/redux.mjs",
      "reselect": "https://cdn.jsdelivr.net/npm/reselect@^4.0.0/es/index.js"
    }
  }
</script>

<body>`
    )

    console.log(
      `importmaps have been reworked. Any pre-existing importmaps have been removed, please edit 'index.html' to re-add them, if any`
    )
  }

  await fs.writeFile(`index.html`, index)
}
