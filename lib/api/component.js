// The default and recommended way of building web components in Tiden.
//
// We're using Haunted web components as a base: https://github.com/matthewp/haunted
//
// We then patch it to add:
//
// 1. HMR support: components will reload without the need to reload whole page
//
// 2. Error boundaries: when something fails it will render the error message instead of dying
//    This is 'renderWithErrorBoundry' below

import {
  component,
  html,
  useEffect,
  useState,
  useLayoutEffect,
} from "../../vendor/haunted.js"
import { css as cssOrig } from "../../vendor/css-tag.js"
import hmr, { isLocal } from "./hmr.js"
import getCallerFile from "../getCallerFile.js"

const targets = {}
let component

if (isLocal) {
  component = function (tagName, render, { styles = `` } = {}) {
    function redrawAllInstances() {
      targets[tagName].instances.forEach((i) => {
        if (i) {
          i._scheduler.update.call(i._scheduler)
        }
      })
    }

    if (!targets[tagName]) {
      targets[tagName] = {
        instances: [],
        styles: styles,
      }

      if (window.customElements && window.customElements.get(tagName)) {
        console.error(
          `The tag named '${tagName}' has already been defined and will not be replaced. Probably one of your dependencies is using another version of it.\n\nThis will result in undefined behaviour.\n\n`
        )
        return
      }

      window.customElements.define(
        tagName,
        component(function renderProxy(...args) {
          useEffect(() => {
            targets[tagName].instances.push(this)

            return () => {
              targets[tagName].instances.forEach((i, index) => {
                if (i === this) {
                  targets[tagName].instances[index] = null
                }
              })
            }
          }, [])

          function renderWithErrorBoundry(self) {
            try {
              return targets[tagName].render.apply(self, args)
            } catch (e) {
              console.error(e)
              return formatError(e)
            }
          }

          return html`
            ${!targets[tagName].styles
              ? null
              : html`<style>
                  ${targets[tagName].styles}
                </style>`}
            ${renderWithErrorBoundry(this)}
          `
        })
      )

      const myFilename = getCallerFile()
      listen((filename) => {
        if (filename === myFilename) {
          import(`/${filename}?${new Date().getTime()}`).catch((e) => {
            targets[tagName].render = () => formatError(e)
            redrawAllInstances()
          })
          return true
        }
        if (filename === styles.hotreload) {
          import(`/${filename}?${new Date().getTime()}`).then(
            ({ default: newStyles }) => {
              targets[tagName].styles = newStyles
              targets[tagName].instances.forEach((i) => {
                if (i) {
                  i._scheduler.update.call(i._scheduler)
                }
              })
            }
          )
          return true
        }
      })
    } else {
      redrawAllInstances()
    }

    targets[tagName].render = render
  }
} else {
  const register = {}
  window.customElements.register = register

  component = function (tagName, render, { styles = `` } = {}) {
    const caller = getCallerFile()

    if (register[tagName]) {
      console.error(
        `The tag named '${tagName}' has already been defined and will not be replaced. Probably one of your dependencies is using an old version.\n\nIt was previously defined here: ${register[tagName]}\nAnd then attempted to be redefined here: ${caller}\nThis will result in undefined behaviour.\n\n`
      )
      return
    }
    register[tagName] = caller

    window.customElements.define(
      tagName,
      component(function (...args) {
        return html`
          ${!styles
            ? null
            : html`<style>
                ${styles}
              </style>`}
          ${render.call(this, ...args)}
        `
      })
    )
  }
}

let css
if (isLocal) {
  css = function (...args) {
    const styles = cssOrig(...args)
    styles.hotreload = getCallerFile()
    return styles
  }
} else {
  css = cssOrig
}

function useCssVariable(el, cssVarName) {
  console.warn(
    `'useCssVariable' is legacy and will be removed in a future version.`
  )
  if (!el || !cssVarName) {
    return undefined
  }
  function getVal() {
    let val = getComputedStyle(el).getPropertyValue(cssVarName)
    if (val.includes(`calc`)) {
      val = val.split(`(`)[1].split(`)`)[0]
    }
    return eval(val)
  }

  const [cssVar, setCssVar] = useState(getVal())

  useEffect(() => {
    const onResize = () => {
      setCssVar(getVal())
    }
    window.addEventListener(`resize`, onResize)

    return () => {
      window.removeEventListener(`resize`, onResize)
    }
  }, [el, cssVarName])

  return cssVar
}

function useElementWidth(el, thresholds) {
  console.warn(
    `'useElementWidth' is legacy and will be removed in a future version.`
  )
  if (!el || !thresholds) {
    return undefined
  }

  if (typeof thresholds === `number`) {
    thresholds = [thresholds]
  }

  function findBracket() {
    const width =
      (el.getBoundingClientRect && el.getBoundingClientRect().width) ||
      el.clientWidth

    let found = 0
    thresholds.forEach((t, i) => {
      if (width > t) {
        found = i + 1
      }
    })

    return found
  }

  const [bracket, setBracket] = useState(findBracket())

  useEffect(() => {
    let ro

    const onResize = () => {
      const newBracket = findBracket()
      if (newBracket !== bracket) {
        setBracket(newBracket)
      }
    }

    window.addEventListener(`resize`, onResize)

    if (typeof ResizeObserver !== `undefined`) {
      ro = new ResizeObserver(() => onResize())
      ro.observe(el)
    }

    return () => {
      window.removeEventListener(`resize`, onResize)

      if (ro) {
        ro.unobserve(el)
      }
    }
  }, [el, thresholds])

  return bracket
}

function useAutoFocus(parent, selector) {
  console.warn(
    `'useAutoFocus' is legacy and will be removed in a future version.`
  )
  return useLayoutEffect(() => {
    setTimeout(() => {
      const element = parent.shadowRoot.querySelector(selector)
      if (element) {
        element.focus()
        setTimeout(() => {
          element.focus()
        }, 100)
      }
    }, 100)
  }, [])
}

function formatError(e) {
  const stacktrace = e.stack.map
    ? e.stack.map((it) => it.toString()).join(`\n`)
    : e.stack
  return html` <div
    style="border: 3px dashed red; color: red; font-size: 16px;padding: 8px; min-width: 30px; min-height: 30px; overflow: auto;"
  >
    <pre>
${e.message}

${stacktrace.replace(/http:\/\/.*?\//g, ``)}
    </pre
    >
  </div>`
}

export { css, html, useCssVariable, useElementWidth, useAutoFocus }
export default component
