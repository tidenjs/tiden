// This file is copied from https://unpkg.com/haunted@4.7.0/haunted.js and a few modifications made:
//
// - It uses lit-html from importmap instead of the bundled one.
//   They must use same version or directives won't work)
//
// - Added 'receiver' as fourth argument to Reflect.set on row 236 (HTMLElement
//   can't set HTMLElement properties without a correct 'this' argument).
//   This was merged in master by https://github.com/matthewp/haunted/pull/193
//

// BSD 2-Clause License
//
// Copyright (c) 2018, Matthew Phillips
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { directive, render } from "lit-html"
export { html, render } from "lit-html"

let current
let currentId = 0
function setCurrent(state) {
  current = state
}
function clear() {
  current = null
  currentId = 0
}
function notify() {
  return currentId++
}

const phaseSymbol = Symbol("haunted.phase")
const hookSymbol = Symbol("haunted.hook")
const updateSymbol = Symbol("haunted.update")
const commitSymbol = Symbol("haunted.commit")
const effectsSymbol = Symbol("haunted.effects")
const layoutEffectsSymbol = Symbol("haunted.layoutEffects")
const contextEvent = "haunted.context"

class State {
  constructor(update, host) {
    this.update = update
    this.host = host
    this[hookSymbol] = new Map()
    this[effectsSymbol] = []
    this[layoutEffectsSymbol] = []
  }
  run(cb) {
    setCurrent(this)
    let res = cb()
    clear()
    return res
  }
  _runEffects(phase) {
    let effects = this[phase]
    setCurrent(this)
    for (let effect of effects) {
      effect.call(this)
    }
    clear()
  }
  runEffects() {
    this._runEffects(effectsSymbol)
  }
  runLayoutEffects() {
    this._runEffects(layoutEffectsSymbol)
  }
  teardown() {
    let hooks = this[hookSymbol]
    hooks.forEach((hook) => {
      if (typeof hook.teardown === "function") {
        hook.teardown()
      }
    })
  }
}

const defer = Promise.resolve().then.bind(Promise.resolve())
function runner() {
  let tasks = []
  let id
  function runTasks() {
    id = null
    let t = tasks
    tasks = []
    for (var i = 0, len = t.length; i < len; i++) {
      t[i]()
    }
  }
  return function (task) {
    tasks.push(task)
    if (id == null) {
      id = defer(runTasks)
    }
  }
}
const read = runner()
const write = runner()
class BaseScheduler {
  constructor(renderer, host) {
    this.renderer = renderer
    this.host = host
    this.state = new State(this.update.bind(this), host)
    this[phaseSymbol] = null
    this._updateQueued = false
  }
  update() {
    if (this._updateQueued) return
    read(() => {
      let result = this.handlePhase(updateSymbol)
      write(() => {
        this.handlePhase(commitSymbol, result)
        write(() => {
          this.handlePhase(effectsSymbol)
        })
      })
      this._updateQueued = false
    })
    this._updateQueued = true
  }
  handlePhase(phase, arg) {
    this[phaseSymbol] = phase
    switch (phase) {
      case commitSymbol:
        this.commit(arg)
        this.runEffects(layoutEffectsSymbol)
        return
      case updateSymbol:
        return this.render()
      case effectsSymbol:
        return this.runEffects(effectsSymbol)
    }
    this[phaseSymbol] = null
  }
  render() {
    return this.state.run(() => this.renderer.call(this.host, this.host))
  }
  runEffects(phase) {
    this.state._runEffects(phase)
  }
  teardown() {
    this.state.teardown()
  }
}

const toCamelCase = (val = "") =>
  val.replace(/-+([a-z])?/g, (_, char) => (char ? char.toUpperCase() : ""))
function makeComponent(render) {
  class Scheduler extends BaseScheduler {
    constructor(renderer, frag, host) {
      super(renderer, host || frag)
      this.frag = frag
    }
    commit(result) {
      render(result, this.frag)
    }
  }
  function component(renderer, baseElementOrOptions, options) {
    const BaseElement =
      (options || baseElementOrOptions || {}).baseElement || HTMLElement
    const {
      observedAttributes = [],
      useShadowDOM = true,
      shadowRootInit = {},
    } = options || baseElementOrOptions || {}
    class Element extends BaseElement {
      constructor() {
        super()
        if (useShadowDOM === false) {
          this._scheduler = new Scheduler(renderer, this)
        } else {
          this.attachShadow({ mode: "open", ...shadowRootInit })
          this._scheduler = new Scheduler(renderer, this.shadowRoot, this)
        }
      }
      static get observedAttributes() {
        return renderer.observedAttributes || observedAttributes || []
      }
      connectedCallback() {
        this._scheduler.update()
      }
      disconnectedCallback() {
        this._scheduler.teardown()
      }
      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
          return
        }
        let val = newValue === "" ? true : newValue
        Reflect.set(this, toCamelCase(name), val)
      }
    }
    function reflectiveProp(initialValue) {
      let value = initialValue
      return Object.freeze({
        enumerable: true,
        configurable: true,
        get() {
          return value
        },
        set(newValue) {
          value = newValue
          this._scheduler.update()
        },
      })
    }
    const proto = new Proxy(BaseElement.prototype, {
      getPrototypeOf(target) {
        return target
      },
      set(target, key, value, receiver) {
        let desc
        if (key in target) {
          desc = Object.getOwnPropertyDescriptor(target, key)
          if (desc && desc.set) {
            desc.set.call(receiver, value)
            return true
          }
          Reflect.set(target, key, value, receiver)
          return true
        }
        if (typeof key === "symbol" || key[0] === "_") {
          desc = {
            enumerable: true,
            configurable: true,
            writable: true,
            value,
          }
        } else {
          desc = reflectiveProp(value)
        }
        Object.defineProperty(receiver, key, desc)
        if (desc.set) {
          desc.set.call(receiver, value)
        }
        return true
      },
    })
    Object.setPrototypeOf(Element.prototype, proto)
    return Element
  }
  return component
}

class Hook {
  constructor(id, state) {
    this.id = id
    this.state = state
  }
}
function use(Hook, ...args) {
  let id = notify()
  let hooks = current[hookSymbol]
  let hook = hooks.get(id)
  if (!hook) {
    hook = new Hook(id, current, ...args)
    hooks.set(id, hook)
  }
  return hook.update(...args)
}
function hook(Hook) {
  return use.bind(null, Hook)
}

function createEffect(setEffects) {
  return hook(
    class extends Hook {
      constructor(id, state, ignored1, ignored2) {
        super(id, state)
        setEffects(state, this)
      }
      update(callback, values) {
        this.callback = callback
        this.lastValues = this.values
        this.values = values
      }
      call() {
        if (!this.values || this.hasChanged()) {
          this.run()
        }
      }
      run() {
        this.teardown()
        this._teardown = this.callback.call(this.state)
      }
      teardown() {
        if (typeof this._teardown === "function") {
          this._teardown()
        }
      }
      hasChanged() {
        return (
          !this.lastValues ||
          this.values.some((value, i) => this.lastValues[i] !== value)
        )
      }
    }
  )
}

function setEffects(state, cb) {
  state[effectsSymbol].push(cb)
}
const useEffect = createEffect(setEffects)

const useContext = hook(
  class extends Hook {
    constructor(id, state, _) {
      super(id, state)
      this._updater = this._updater.bind(this)
      this._ranEffect = false
      this._unsubscribe = null
      setEffects(state, this)
    }
    update(Context) {
      if (this.state.virtual) {
        throw new Error("can't be used with virtual components")
      }
      if (this.Context !== Context) {
        this._subscribe(Context)
        this.Context = Context
      }
      return this.value
    }
    call() {
      if (!this._ranEffect) {
        this._ranEffect = true
        if (this._unsubscribe) this._unsubscribe()
        this._subscribe(this.Context)
        this.state.update()
      }
    }
    _updater(value) {
      this.value = value
      this.state.update()
    }
    _subscribe(Context) {
      const detail = { Context, callback: this._updater }
      this.state.host.dispatchEvent(
        new CustomEvent(contextEvent, {
          detail,
          bubbles: true,
          cancelable: true,
          composed: true,
        })
      )
      const { unsubscribe, value } = detail
      this.value = unsubscribe ? value : Context.defaultValue
      this._unsubscribe = unsubscribe
    }
    teardown() {
      if (this._unsubscribe) {
        this._unsubscribe()
      }
    }
  }
)

function makeContext(component) {
  return (defaultValue) => {
    const Context = {
      Provider: class extends HTMLElement {
        constructor() {
          super()
          this.listeners = new Set()
          this.addEventListener(contextEvent, this)
        }
        disconnectedCallback() {
          this.removeEventListener(contextEvent, this)
        }
        handleEvent(event) {
          const { detail } = event
          if (detail.Context === Context) {
            detail.value = this.value
            detail.unsubscribe = this.unsubscribe.bind(this, detail.callback)
            this.listeners.add(detail.callback)
            event.stopPropagation()
          }
        }
        unsubscribe(callback) {
          this.listeners.delete(callback)
        }
        set value(value) {
          this._value = value
          for (let callback of this.listeners) {
            callback(value)
          }
        }
        get value() {
          return this._value
        }
      },
      Consumer: component(function ({ render }) {
        const context = useContext(Context)
        return render(context)
      }),
      defaultValue,
    }
    return Context
  }
}

const useMemo = hook(
  class extends Hook {
    constructor(id, state, fn, values) {
      super(id, state)
      this.value = fn()
      this.values = values
    }
    update(fn, values) {
      if (this.hasChanged(values)) {
        this.values = values
        this.value = fn()
      }
      return this.value
    }
    hasChanged(values = []) {
      return values.some((value, i) => this.values[i] !== value)
    }
  }
)

const useCallback = (fn, inputs) => useMemo(() => fn, inputs)

function setLayoutEffects(state, cb) {
  state[layoutEffectsSymbol].push(cb)
}
const useLayoutEffect = createEffect(setLayoutEffects)

const useState = hook(
  class extends Hook {
    constructor(id, state, initialValue) {
      super(id, state)
      this.updater = this.updater.bind(this)
      if (typeof initialValue === "function") {
        initialValue = initialValue()
      }
      this.makeArgs(initialValue)
    }
    update() {
      return this.args
    }
    updater(value) {
      if (typeof value === "function") {
        const updaterFn = value
        const [previousValue] = this.args
        value = updaterFn(previousValue)
      }
      this.makeArgs(value)
      this.state.update()
    }
    makeArgs(value) {
      this.args = Object.freeze([value, this.updater])
    }
  }
)

const useReducer = hook(
  class extends Hook {
    constructor(id, state, _, initialState, init) {
      super(id, state)
      this.dispatch = this.dispatch.bind(this)
      this.currentState = init !== undefined ? init(initialState) : initialState
    }
    update(reducer) {
      this.reducer = reducer
      return [this.currentState, this.dispatch]
    }
    dispatch(action) {
      this.currentState = this.reducer(this.currentState, action)
      this.state.update()
    }
  }
)

const useRef = (initialValue) =>
  useMemo(
    () => ({
      current: initialValue,
    }),
    []
  )

function haunted({ render }) {
  const component = makeComponent(render)
  const createContext = makeContext(component)
  return { component, createContext }
}

const includes = Array.prototype.includes
function makeVirtual() {
  const partToScheduler = new WeakMap()
  const schedulerToPart = new WeakMap()
  class Scheduler extends BaseScheduler {
    constructor(renderer, part) {
      super(renderer, part)
      this.state.virtual = true
    }
    render() {
      return this.state.run(() => this.renderer.apply(this.host, this.args))
    }
    commit(result) {
      this.host.setValue(result)
      this.host.commit()
    }
    teardown() {
      super.teardown()
      let part = schedulerToPart.get(this)
      partToScheduler.delete(part)
    }
  }
  function virtual(renderer) {
    function factory(...args) {
      return (part) => {
        let cont = partToScheduler.get(part)
        if (!cont) {
          cont = new Scheduler(renderer, part)
          partToScheduler.set(part, cont)
          schedulerToPart.set(cont, part)
          teardownOnRemove(cont, part)
        }
        cont.args = args
        cont.update()
      }
    }
    return directive(factory)
  }
  return virtual
}
function teardownOnRemove(cont, part, node = part.startNode) {
  let frag = node.parentNode
  let mo = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (includes.call(mutation.removedNodes, node)) {
        mo.disconnect()
        if (node.parentNode instanceof ShadowRoot) {
          teardownOnRemove(cont, part)
        } else {
          cont.teardown()
        }
        break
      } else if (includes.call(mutation.addedNodes, node.nextSibling)) {
        mo.disconnect()
        teardownOnRemove(cont, part, node.nextSibling || undefined)
        break
      }
    }
  })
  mo.observe(frag, { childList: true })
}

const { component, createContext } = haunted({ render })
const virtual = makeVirtual()

export default haunted
export {
  BaseScheduler,
  Hook,
  State,
  component,
  createContext,
  hook,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  virtual,
}
