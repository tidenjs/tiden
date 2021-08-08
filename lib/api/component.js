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
  component as origComponent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "../../vendor/haunted.js"
import { css as cssOrig } from "../../vendor/css-tag.js"
import { html } from "lit-html"
import hmr, { isLocal } from "./hmr.js"
import getCallerFile from "../getCallerFile.js"

const targets = {}
let component

if (isLocal) {
  component = function (tagName, arg1, arg2) {
    let render, styles, opts

    if (typeof arg1 === `function`) {
      render = arg1
      opts = arg2
    } else {
      render = arg2
      opts = arg1
    }

    if (!opts) {
      opts = {}
    }

    styles = opts.styles || opts.css

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
        origComponent(function renderProxy(...args) {
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
      hmr((filename) => {
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

  component = function (tagName, render, { css = ``, styles = `` } = {}) {
    styles = css || styles
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
      origComponent(function (...args) {
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

export {
  css,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
}
export default component
