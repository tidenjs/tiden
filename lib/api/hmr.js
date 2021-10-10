const changedFiles = new Set()
const cbs = []

export const isLocal =
  [`192.`, `0.0.0.0`, `localhost`, `.local`].find((p) =>
    document.location.origin.includes(p)
  ) || localStorage.forceLocal

export function start(url) {
  let delayAnnounce

  try {
    if (isLocal) {
      const source = new EventSource(url)
      source.onmessage = (message) => {
        const { path, exists } = JSON.parse(message.data)

        if (!exists) {
          // we can't handle deletions in this project. Reload everything.
          document.location.reload()
        }

        changedFiles.add(path)
        if (delayAnnounce) {
          // debounce, so don't do anything right now
        } else {
          announce()
        }
      }
    }

    /*eslint no-inner-declarations: "off"*/
    function announce() {
      const ours = [...changedFiles]

      if (ours.count > 0) {
        // schedule any following events to delay 10ms not to overflow app
        delayAnnounce = setTimeout(announce, 10)
      } else {
        delayAnnounce = false
      }

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
}

export default function hmr(cb) {
  cbs.push(cb)

  return () => {
    cbs.forEach((ocb, i) => {
      if (ocb === cb) {
        cbs[i] = null
      }
    })
  }
}
