// this implementation of history is very limited.
//
// currently it can only replace the url
//
// However, there are plans to implement this fully: https://github.com/tidenjs/tiden/issues/37

import { respondTo, stream } from "tiden"

import { getCurrentPosition } from "./pop.js"

let history = [
  {
    title: ``,
    url: new URL(document.location),
  },
]

export default stream(`history`, function* historyStream() {
  yield respondTo(`get`, `history`, function* () {
    return history
  })

  yield respondTo(`replace`, `history`, function* ({ title, url }) {
    const i = getCurrentPosition()

    window.history.replaceState({ i }, title, url)
    console.log(history)
    history = history.slice()
    history[i] = {
      title,
      url,
    }

    if (title) {
      document.title = title
    }

    return history
  })
})
