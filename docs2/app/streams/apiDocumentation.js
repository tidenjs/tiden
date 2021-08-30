import { stream, respondTo } from "tiden"

export default stream(`apiDocumentation`, function* language() {
  const data = [
    {
      name: `publish`,
      markup: [
        {
          p: `Broadcasts a message without waiting for any responses. Typically used to announce that something has happened, or in more rarecases to directly submit information to downstream subscribers.`,
        },
        { h3: `Example` },
        {
          pre: `yield publish(\`tabFocusChanged\`, { isFocused: false }, { ...extras })`,
        },
        { h3: `Interface` },
        {
          pre: `publish(type: string, data = null: any, extras = null: object)`,
        },
      ],
    },
    {
      name: `cache`,
      markup: [
        {
          p: `            
              Low level function to create saga that caches the return value.
              Useful to avoid expensive requests for resource and/or
              computation. Nearly always used together with
              <code>respondTo</code>
            `,
        },
        {
          p: `Typically, using <code>merge</code> would be better as it fulfills
              most usecases while also caching.`,
        },
        {
          h3: `Examples`,
        },
        { h3: `Interface` },
        {
          pre: `
            const cached = cache()
            
            yield respondTo(\`get\`, \`fingerprint\`, cached(function*() {
              console.log(\`hit\`)
              return navigator.userAgent.reduce((sum, char) =&gt; sum + char.charCodeAt(0), 0)
            })

            yield request(\`get\`, \`fingerprint\`)
            yield request(\`get\`, \`fingerprint\`
            // 'hit' is only displayed once
          `,
        },
        {
          pre: `
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
          `,
        },
        { h3: `Interface` },
        { pre: `
          function* cache(keyFunction(data: any, extras: object): function
        ` },
        {p: `
          Key Function may be omitted. If supplied, it must be a function
          that returns a string based on the request object. This string is
          used as a unique identifier, causing requests of similar nature to
          be cached independently.
        `}

      ],
    },
    { name: `connect` },
    { name: `s` },
    { name: `linkTo` },
    { name: `subscribe` },
    { name: `merge` },
    { name: `mutex` },
    { name: `once` },
    { name: `request` },
    { name: `respondToSync` },
    { name: `simpleStream` },
    { name: `waitFor` },
    { name: `whenChanged` },
    { name: `all` },
    { name: `delay` },
    { name: `fork` },
    { name: `spawn` },
  ]

  let selectedMethod = data[0]

  yield respondTo(`get`, `selectedMethod`, function* () {
    return selectedMethod
  })

  yield respondTo(`set`, `selectedMethod`, function* (method) {
    selectedMethod = data.find(({ name }) => name === method)
    return selectedMethod
  })

  yield respondTo(`get`, `apiDocumentation`, function* () {
    return data
  })
})
