const changedFiles = new Set()
const cbs = []

try {
  const url = new URL(`/changes`, location.origin)
  url.protocol = `ws:`

  if (
    window.location.origin.includes(`localhost`) ||
    window.location.origin.includes(`0.0.0.0`) ||
    window.location.origin.includes(`192.`) ||
    window.location.origin.includes(`127.`)
  ) {
    new WebSocket(url).onmessage = (message) => {
      console.log(message.data)
      const { path, exists } = JSON.parse(message.data)

      if (!exists) {
        // we can't handle deletions in this project. Reload everything.
        document.location.reload()
      }
      document.location.reload()

      changedFiles.add(path)
    }

    setInterval(announce, 10)
  }

  /*eslint no-inner-declarations: "off"*/
  function announce() {
    const ours = [...changedFiles]
    changedFiles.clear()

    ours.forEach((path) => {
      let any = false
      cbs.forEach((cb) => {
        if (cb) {
          any = any || cb(path)
          if (any) {
            console.debug(
              `=== reloaded: ${path.split(`/`).pop().split(`.`).shift()} ===`
            )
          }
        }
      })
      if (!any) {
        document.location.reload()
      }
    })
  }
} catch (e) {
  console.error(e)
}

export function listen(cb) {
  cbs.push(cb)

  return () => {
    cbs.forEach((ocb, i) => {
      if (ocb === cb) {
        cbs[i] = null
      }
    })
  }
}
