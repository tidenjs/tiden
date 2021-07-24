import o from "outdent"

export default () => o`
  import {
    router,
    fork,
    cancel,
    whenChanged,
    request,
    subscribe,
    publish,
  } from "tiden"

  export default function* app() {
    const root = document.body.getElementById(\`root\`)
    const page = yield request(\`page\`)
    let pageDefinition = router.get(page.id)
    let task = yield fork(pageDefinition.saga, root)

    yield subscribe(\`error\`, function* (error) {
      console.error(error)
      root.innerHTML = \`<pre>An error occured:\\n\\n\${e.message}\\n\\n\${e.stack}</pre>\`
    })

    yield fork(streams)

    yield subscribe(
      \`page\`,
      whenChanged(function* (page) {
        try {
          pageDefinition = router.get(page.id)
          yield cancel(task)
          task = yield fork(pageDefinition.saga, root)
        } catch (e) {
          publish(\`error\`, e)
        }
      })
    )

    // set initial page to the current url
    yield request(\`set\`, \`page\`, router.interpret(document.location))
  }
`
