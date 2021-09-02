import { stream, respondTo } from "tiden"
// import marked from "../../node_modules/marked"

export default stream(`apiDocumentation`, function* language() {
  const data = [
    {
      name: `publish`,
      markup:`
        Marked - Markdown Parser
========================

[Marked] lets you convert [Markdown] into HTML.  Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

How To Use The Demo
-------------------

1. Type in stuff on the left.
2. See the live updates on the right.

That's it.  Pretty simple.  There's also a drop-down option in the upper right to switch between various views:

- **Preview:**  A live display of the generated HTML as it would render in a browser.
- **HTML Source:**  The generated HTML before your browser makes it pretty.
- **Lexer Data:**  What [marked] uses internally, in case you like gory stuff like this.
- **Quick Reference:**  A brief run-down of how to format things using markdown.

Why Markdown?
-------------

It's easy.  It's not overly bloated, unlike HTML.  Also, as the creator of [markdown] says,

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

Ready to start writing?  Either start changing stuff on the left or
[clear everything](/demo/?text=) with a simple click.

[Marked]: https://github.com/markedjs/marked/
[Markdown]: http://daringfireball.net/projects/markdown/
   
      `
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

  yield respondTo(`get`, `marked`, function* () {
    return []
  })
})
