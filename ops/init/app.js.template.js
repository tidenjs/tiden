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
  import {takeEvery} from "redux-saga/effects.js"

  export default function* app() {
    yield subscribe(\`error\`, function* (error) {
      console.error(error)
      root.innerHTML = \`<pre>An error occured:\\n\\n\${e.message}\\n\\n\${e.stack}</pre>\`
    })

    yield subscribe(\`*\`, function*(data, rest) {
      console.log(rest.type, data)
    })

    yield fork(streams)

    const root = document.getElementById(\`root\`)
    let task

    yield subscribe(
      \`page\`,
      whenChanged(function* (page) {
        try {
          const pageDefinition = router.get(page.id)
          console.log('starting ', pageDefinition)
          if (task) {
            yield cancel(task)
          }
          task = yield fork(pageDefinition.saga, root)
        } catch (e) {
          yield publish(\`error\`, e)
        }
      })
    )

    // set initial page to the current url
    const pageDefinition = router.interpret(document.location)
    if (pageDefinition) {
      yield request(\`set\`, \`page\`, pageDefinition)
    } else {
      yield publish(\`error\`, \`The location \${document.location} was not found.\`, { id: \`404\` })
    }
  }

  export function* streams() {
  }

`
