// this stream prevents 'history' and 'window' from implicitly making changes to navigation.
//
// Instead, it publishes a 'pop' message so that user can decide what to do.

import { fork, publish, stream } from "tiden"

let globalI = window.history.length
let i = 0

export function getCurrentPosition() {
  return i
}

export function setCurrentPosition(newI) {
  i = newI
}

export default stream(`pop`, function* url() {
  yield fork(initialize)
  yield fork(tamePopstate)
  //  yield fork(tameHashchange)
})

// if there are no entries in native History object then it will exit the app when user pushes
// back button. This is usually not desirable, and in pushing one entry explicitly we make sure
// that this application keeps control over the back button. If we really want to go out of the
// app, then the Page may decide to do so explicitly using:
// document.location.href = document.referrer
function* initialize() {
  // add the first entry in browser history so that back-button can be clicked
  window.history.pushState({ i }, ``, document.location.href)
}

function* tamePopstate() {
  let resolve
  function popstate(e) {
    if (resolve) {
      resolve(e)
    }
  }

  try {
    window.addEventListener(`popstate`, popstate)

    while (true) {
      const promise = new Promise((res) => {
        resolve = res
      })
      const e = yield promise

      const requested = e.state ? e.state.i : -1
      if (requested === i) {
        // this is probably a loop, just ignore this
      } else {
        // go back to where you came from! The user will decide if anything should happen, not you!
        window.history.go(i - requested)

        yield publish(`pop`, { requested, current: i })
      }
    }
  } finally {
    window.removeEventListener(`popstate`, popstate)
  }
}

function* tameHashchange() {
  let resolve
  function hashchange(e) {
    if (resolve) {
      resolve(e)
    }
  }

  try {
    window.addEventListener(`hashchange`, hashchange)

    while (true) {
      const promise = new Promise((res) => {
        resolve = res
      })
      const e = yield promise

      const requested = e.state ? e.state.i : -1
    }
  } finally {
    window.removeEventListener(`hashchange`, hashchange)
  }
}
