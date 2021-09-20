import { stream, respondTo } from "tiden"
import o from "https://cdn.jsdelivr.net/npm/outdent@0.8.0/lib-module/index.js"

export default stream(`methods`, function* methods() {
  yield respondTo(`get`, `methods`, function* () {
    return [
      {
        name: `publish`,
        markdown: o`
          ## Publish
          Broadcasts a \`\`\`message\`\`\` without waiting for any responses. Typically used to announce that something has happened, or in more rare cases to directly submit information to downstream subscribers.
          ### Example
               yield publish(\`tabFocusChanged\`, { isFocused: false }, { ...extras })
          ### Interface
               publish(type: string, data = null: any, extras = null: object)
      `,
      },
      {
        name: `cache`,
        markdown: o`
          ## Cache
          Low level function to create saga that caches the return value. Useful to avoid expensive requests for resource and/or computation. Nearly always used together with \`\`\`respondTo\`\`\`
          Typically, using \`\`\`merge\`\`\` would be better as it fulfills most usecases while also caching.
          ### Examples
                const cached = cache()

                yield respondTo(\`get\`, \`fingerprint\`, cached(function*() {
                console.log(\`hit\`)
                return navigator.userAgent.reduce((sum, char) =&gt; sum + char.charCodeAt(0), 0)
                })

                yield request(\`get\`, \`fingerprint\`)
                yield request(\`get\`, \`fingerprint\`)
                // 'hit' is only displayed once
          \`\`\`  \`\`\`
                
                const cached = cache((number, {user}) =&gt; \`\${user}-\${number}\` )
                yield respondTo(\`get\`, \`someNumber\`, cached(function*(number, {user}) {
                   console.log(user, number)
                   return \`hello\`
                 })

                 yield request(\`get\`, \`someNumber\`, 3, { user: \`Mr. Anderson\` })
                 yield request(\`get\`, \`someNumber\`, 3, { user: \`Mr. Anderson\` }) // cached
                 yield request(\`get\`, \`someNumber\`, 1, { user: \`Mr. Anderson\` })
                 yield request(\`get\`, \`someNumber\`, 1, { user: \`Mr. Anderson\` }) // cached
                 yield request(\`get\`, \`someNumber\`, 3, { user: \`Mr. Petersen\` }) 
                        
                 // hit is displayed 3 times, because caching algorithm is based on both number and user name
                 
          ### Interface
                 function* cache(keyFunction(data: any, extras: object): function
          Key Function may be omitted. If supplied, it must be a function that returns a string based on the request object. This string is used as a unique identifier, causing requests of similar nature to be cached independently.
        `,
      },
      {
        name: `connect`,
        markdown: o`
          ## Connect

          A high-level method of specifying properties on a html element. It requests initial upstream data, processes the data, and sets up subscriptions. This is the recommended approach to binding data to Web Components.

          The command will block until any function properties return a value. This value will be passed back to caller.

          ### Examples

                        let currentBird = {
                          name: \`ducks\`,
                          changedAt: new Date()
                        }

                        yield respondTo(\`get\`, \`bird\`, function*() {
                          return currentBird
                        })
                        yield respondTo(\`set\`, \`bird\`, function*(newBird) {
                          currentBird = {
                            name: newBird,
                            changedAt: new Date()
                          }
                          return currentBird
                        })

                        component(\`x-bird\`, {}, function bird({name, title, onChange, close}) {
                          return html\`
                            &lt;h1&gt;\${title}&gt;h1&lt;

                            &lt;b&gt;\${name}&lt;/b&gt;: Tweet tweet.

                            &lt;input .input=\${(e) =&gt; onChange(e.target.value)}&gt; &lt;/input&gt;

                            &lt;button .onClick=\${close}&gt;Close&lt;/button&gt;
                          \`
                        })

                        const el = document.createElement(\`x-bird\`)

                        const ret = yield connect(el, {
                          title: \`Birds!!!\`,
                          name: s(\`bird\`, bird =&gt; bird.name),
                          *onChange(newBirdName) {
                            yield request(\`set\`, \`bird\`, newBirdName)
                          },
                          *close() {
                            return \`User chose to close this.\`
                          }
                        })

                        console.log(ret) // \`User chose to close this\`

          ### Interface

                        function* connect(el: HTMLElement, selectors: Object, params?: Params): Task

                        interface Params {
                            assets?: Array&lt;string&gt;,
                            onReady?: GeneratorFunction
                        }

          \`\`\`selector\`\`\` is a complex object where each key is mapped to a property on the element. The behavior depends on the value type:

          When value is created with \`\`\`s\`\`\` command, then it will be a selector. If the selector returns a generator function or a \`\`\`object\`\`\` including one or more generator functions, they are replaced with proxies to Tiden messaging. In short, this means you can use \`\`\`yield\`\`\` as usual within generator functions.

          When value is a \`\`\`GeneratorFunction\`\`\` then it is replaced  with a proxy function as above.

          When value is a \`\`\`object\`\`\` then it is passed on to element, replacing any generator functions as above.

          When value is a primitive type other than array, then it is passed on to the element.

          Value is not allowed to be an array. This datatype is reserved for the future.
    `,
      },
      {
        name: `s`,
        markdown: o`
          ## S

          Creates a definition for merging one or more streams into a HTMLElement property.

          Note that while this is currently the recommended way of setting properties on HTMLElements, other methods are currently being discussed and might become the future recommendation. In either case, \`\`\`s\`\`\` is unlikely to be deprecated for a long time.

          Note that there is some 'magic' being done with the return value from selectors. Any GeneratorFunctions will be replaced with regular functions that proxy communication to Tiden. This is necessary because the callback does not exist within the communication model.

          ### Examples

          Also see example from \`\`\`connect\`\`\` above.


                        // set the latest value of \`language\` stream
                        s(\`language\`) 

                        // set the id from latest value of of \`language\` stream
                        s(\`language\`, language =&gt; language.id)

                        // combine serveral streams
                        s(\`language\`, \`translations\`, (language, translations) =&gt; 
                        translations[language.id].bird)


          ### Interface

                        s(stream1: string, stream2: string, streamX: string, combinator: 
                        function(stream1Value: Any, stream2Value: Any, streamXValue: Any)): Selector
                      
    `,
      },
      {
        name: `linkTo`,
        markdown: o`
          ## linkTo

          Creates an object suitable for \`\`\`x-touchable\`\`\`, mapping both \`\`\`onClick\`\`\` and \`\`\`href\`\`\` from a given page location.

          ### Examples 
                        yield connect(someElement, {
                          link: linkTo({
                            id: \`somePage\`,
                            someValue: \`data\`,
                          })
                        })

          ### Interface

                        interface TouchableArgs {
                          onClick: Function,
                          href: string,
                          target: string,
                        }
                        
                        function linkTo(page: Object, args?: { target: \`_blank\` }): TouchableArgs

    `,
      },
      {
        name: `subscribe`,
        markdown: o`
          ## subscribe

          Sets up a listener for a stream. The provided function will be called for every message captured. Does not block.

          ### Examples

                        yield subscribe(\`tabFocus\`, function*(isFocused) {
                          console.log(isFocused ? \`The tab has been focused\` : \`The tab lost focus\`)
                        })

          ### Interface

                        subscribe(type: string, actor: GeneratorFunction): Task

    `,
      },
      {
        name: `merge`,
        markdown: o`
          ## merge

          Combines one or more streams and optionally creates a new stream. Using \`\`\`merge\`\`\` is the recommended way to create streams that are dependent on other streams.
                        
                          Note: Before Tiden 0.0.1 this was called
                          \`\`\`confluence\`\`\`

          If \`\`\`undefined\`\`\` is returned then it is assumed that there isn't a new value for the new stream. The new stream won't output anything.


          Streams created with \`\`\`merge\`\`\` are always cached. The provided \`\`\`actor\`\`\` function is only called when there are upstream changes.

          Does not block

          ### Examples
                      
                        yield simpleStream(\`a\`, 0)
                        yield simpleStream(\`b\`, 0)

                        yield fork(function*() {
                          let value = 0
                          while (true) {
                            yield request(\`set\`, \`a\`, value++)
                            yield delay(1000)
                          }
                        })

                        yield fork(function*() {
                          let value = 0
                          while (true) {
                            yield request(\`set\`, \`b\`, value++)
                            yield delay(1200)
                          }
                        })

                        yield merge([\`a\`, \`b\`], \`c\`, function*(a, b) {
                          return \`a: \${a}    b: \${b}\`
                        })

                        yield listenFor(\`c\`, function*(c) {
                          console.log(c)
                        })

                        // The new stream c uses values from a and b, which are changed every 1000 and 1200 ms
                        // The console output is:
                        //
                        // a: 0   b: 0
                        // a: 1   b: 0
                        // a: 1   b: 1
                        // a: 2   b: 1
                        // .... and so on

          ### Interface
                      
                        merge(streams: array&lt;string&gt;, stream: string, actor: GeneratorFunction)
             
    `,
      },
      {
        name: `mutex`,
        markdown: o`
          ## mutex

          Makes sure that only one Task is executing within a block of code at a time

          ### Examples
                      
                        const lock = mutex()

                        function* writeA() {
                          yield lock(function*() {
                            yield delay(500)
                            console.log(\`a\`)
                          })
                        }

                        function* writeB() {
                          yield lock(function*() {
                            yield delay(10)
                            console.log(\`b\`)
                          })
                        }

                        yield fork(writeA)
                        yield fork(writeB)


                        // outputs \`a\` and then \`b\` because B cannot execute before A releases the lock.
                      

          ### Interface
                      
                        mutex(): GeneratorFunction

                        lock(actor: GeneratorFunction) 
                      
    `,
      },
      {
        name: `once`,
        markdown: o`
          ## once

          Shorthand for cache()(actor: GeneratorFunction)

          ### Examples

                        yield respondTo(\`get\`, \`bird\`, once(function*() {
                          console.log(\`Actor function called!\`)
                          return \`duck\`
                        })

                        console.log(yield request(\`bird\`))
                        console.log(yield request(\`bird\`))

                        // Output:
                        //
                        // Actor function called!
                        // duck
                        // duck

          ### Interface
                      
    `,
      },
      {
        name: `request`,
        markdown: o`
          ## request

          Makes a requests to stream, or \`\`\`respondTo\`\`\` directive. Blocks until response is ready.

          Returns the response value, or throws an error

          ### Examples

                        yield respondTo(\`delete\`, \`bird\`, function*() {
                          ...make some REST requests here to delete it
                          if (success) {
                            return true
                          } else {
                            throw new Error(errorMsg)
                          }
                        })

                        try {
                          const success = yield request(\`delete\`, \`bird\`)
                          console.log(success ? \`Bird deleted successfully\` : \`Bird already deleted\`)
                        } catch(e) {
                          console.error(e)
                        }

          ### Interface
                      
                        respondTo(verb: string, noun: string, actor: GeneratorFunction)
    `,
      },
      {
        name: `respondToSync`,
        markdown: o`
          ## respondToSync

          Blocks until a request arrives, and finishes after a single response has been made.

          Two forms are available. If a third parameter is provided then it is used as the return data and a SyncObject won't be returned.

          ### Examples
                      
                        yield fork(function*() {
                          yield delay(1000)
                          const response = yield request(\`birds\`)
                          console.log(response)
                        })

                        yield respondToSync(\`get\`, \`birds\`, [\`satanic nightjar\`, \`horned screamer\`, \`sad flycatcher\`])
                      

                      
                        yield fork(function*() {
                          yield delay(1000)
                          const response = yield request(\`birds\`)
                          console.log(response)
                        })

                        const req = yield respondToSync(\`get\`, \`birds\`)
                        console.log(\`Someone made a request! Using \${req.data} and \${reg.metadata}\`)
                        yield req.respond([\`satanic nightjar\`, \`horned screamer\`, \`sad flycatcher\`])

          ### Interface
                      
                        interface SyncObject {
                          data: Any,
                          metadata: Object,
                          respond: GeneratorFunction
                        }

                        (yield respondToSync(verb: string, noun: string)): SyncObject

                        yield respondToSync(verb: string, noun: string, data: Any)
                      
    `,
      },
      {
        name: `simpleStream`,
        markdown: o`
          ## simpleStream

          Creates a very basic stream that has an initival value and respond to \`\`\`get\`\`\` and \`\`\`set\`\`\` verbs

          ### Examples
                      
                        yield simpleStream(\`bird\`, \`Swallow\`)

                        yield request(\`get\`, \`bird\`) // \`Swallow\`

                        yield request(\`set\`, \`bird\`, \`sad flycatcher\`)

                        yield request(\`get\`, \`bird\`) // \`sad flycatcher\`
                      

          ### Interface
                      
                        simpleStream(name: string, initialValue?: Any): Task
                      
    `,
      },
      {
        name: `waitFor`,
        markdown: o`
          ## waitFor

          Blocks until a message of specific type arrives.

          Optional second argument is a matcher that should return a boolish based on data and/or metadata

          ### Examples
                      
                        yield fork(function*() {
                          let count = 1000
                          while (true) {
                            yield delay(1000)
                            yield announce(\`lizardAttack\`, { count })
                            count += 1
                          }
                        })

                        const info = yield waitFor(\`lizardAttack\`)
                        console.log(info.data.count) // 1000

                        // we'll be stuck here for 5 seconds
                        const info2 = yield waitFor(\`lizardAttack\`, ({count}, metadata) =&gt; count === 1005 )
                        console.log(info2.data.count) // 1005

          ### Interface
                      
                        interface WaitForObj {
                          data: Any,
                          metadata: Object,
                        }

                        waitFor(type: string, matcher?: function(data: Any, metadata: Object)): WaitForObj
    `,
      },
      {
        name: `whenChanged`,
        markdown: o`
          ## whenChanged

          Filters calls from \`\`\`subscribe\`\`\` to only let through changes to a stream message.

          ### Examples
                      
                        yield simpleConcept(\`bird\`, \`satanic nightjar\`)

                        yield subscribe(\`bird\`, whenChanged(function*(bird) {
                          console.log(\`There was a new bird: \${bird}\`)
                        }))

                        yield request(\`set\`, \`bird\`, \`satanic nightjar\`)
                        yield request(\`set\`, \`bird\`, \`satanic nightjar\`)
                        yield request(\`set\`, \`bird\`, \`satanic nightjar\`)
                        yield request(\`set\`, \`bird\`, \`sad flycatcher\`)
                        yield request(\`set\`, \`bird\`, \`sad flycatcher\`)
                        yield request(\`set\`, \`bird\`, \`swallow\`)

                        // Output:
                        //
                        // satanic nightjar
                        // sad flycatcher
                        // swallow

          A matcher function can also be provided, enabling you to specify what part of the message should be used for uniqueness. Consider this example where the \`\`\`updatedAt\`\`\` is always a new object.

          Does not block.
                      
                        yield simpleConcept(\`bird\`, {id: \`satanic nightjar\`, updatedAt: new Date()})

                        yield subscribe(\`bird\`, whenChanged(({id}) =&gt; id, function*(bird) {
                          console.log(\`There was a new bird: \${bird}\`)
                        }))

                        yield request(\`set\`, \`bird\`, { id: \`satanic nightjar\`, updatedAt: new Date()})
                        yield request(\`set\`, \`bird\`, { id: \`satanic nightjar\`, updatedAt: new Date()})
                        yield request(\`set\`, \`bird\`, { id: \`sad flycatcher\`, updatedAt: new Date()})
                        yield request(\`set\`, \`bird\`, { id: \`sad flycatcher\`, updatedAt: new Date()})
                        yield request(\`set\`, \`bird\`, { id: \`swallow\`, updatedAt: new Date()})

                        // Output:
                        //
                        // satanic nightjar
                        // sad flycatcher
                        // swallow

          ### Interface

                        whenChanged(matcher?: function(data: Any, metadata: Object), actor: GeneratorFunction): Task
                      
    `,
      },
      {
        name: `all`,
        markdown: o`
          ## all

          Waits for all tasks to finish and returns the values.

          ### Examples
                      
                        yield simpleConcept(\`bird\`, \`sad flycatcher\`)

                        const [...ret] = yield all([
                          request(\`bird\`),
                          call(function*() {
                            yield delay(1000)
                            return \`wings\`
                          })
                        ])

                        console.log(ret) // [\`bird\`, \`wings\`]
                      

                      
                        yield simpleConcept(\`bird\`, \`sad flycatcher\`)

                        const ret = yield all({
                          bird: request(\`bird\`),
                          wings: call(function*() {
                            yield delay(1000)
                            return \`wings\`
                          })
                        })

                        console.log(ret) // { bird: \`bird\`, wings: \`wings\` }

          ### Interface
                      
                        all(sagas: Object&lt;string, Task&gt;): Object&lt;string, Task&gt;
                        all(sagas: array&lt;Task&gt;): array&lt;Task&gt;
            
    `,
      },
      {
        name: `delay`,
        markdown: o`
          ## delay

          Creates a blocking effect for given milliseconds.

          ### Examples
                      
                        yield delay(100) // delays for 100ms
                      

          ### Interface
                      
                        delay(ms: number)
                      
              `,
      },
      {
        name: `fork`,
        markdown: `
          ## fork

          Creates a new task that executes in parallel to the currently running Task.

          This is non-blocking.

          ### Examples

                        yield fork(function*() {
                          yield delay(100)
                          console.log(\`a\`)
                        })

                        console.log(\`b\`)

                        // Output:
                        //
                        // b
                        // a

          ### Interface
                      
                        fork(actor: GeneratorFunction): Task
            
    `,
      },
      {
        name: `spawn`,
        markdown: o`
          ## spawn

          Similar to fork, only the task is detached from the parent task. If parent task is cancelled, or throws an error, then the spawned saga would still continue executing. Tiden tasks are no different from Redux Saga tasks. See their documentation for more details: [redux-saga.js.org/docs/advanced/ForkModel]

          ### Examples
                      
                        yield spawn(function*() {
                          yield delay(100)
                          console.log(\`a\`)
                        })

                        console.log(\`b\`)

                        // Output:
                        //
                        // b
                        // a
                      

          ### Interface
                      
                        spawn(actor: GeneratorFunction): Task

          [redux-saga.js.org/docs/advanced/ForkModel]: https://redux-saga.js.org/docs/advanced/ForkModel
    `,
      },
      {
        name: `cancel`,
        markdown: o`
          ## cancel

          Cancels a task, for example created using fork, subscribe,
                        respondTo, merge, etc..


          If no task is specified, then the current task will be cancelled.


          Note that this will also cancel any parent tasks or joiners. Tiden
                        tasks are no different from Redux Saga's tasks. Read more at
                        [redux-saga.js.org/docs/advanced/ForkModel]

          ### Examples

                      
                        const task = yield subscribe(\`tick\`, function*(data) {
                          ...
                        })

                        yield cancel(task)
                      

          ### Interface
                      
                        cancel(task?: Task)

          [redux-saga.js.org/docs/advanced/ForkModel]: https://redux-saga.js.org/docs/advanced/ForkModel
    `,
      },
    ]
  })
})
