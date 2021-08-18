export const bodyImports = {
  tiden: {
    html: [`html`],
    component: [`component`],
    useEffect: [`useEffect`],
    useMemo: [`useMemo`],
  },
}

export const bodyArgs = [
  `link: originalLink`,
  `disabled`,
  `focusTheme`,
  `autoFocus`,
]

export const body = () => `
const link = useMemo(() => {
  return originalLink || {}
}, [originalLink])

const stopPropagation = useMemo(() => {
  return (e) => e.stopPropagation()
}, [])

useEffect(() => {
  const onClickHandler = () => {
    if (!disabled && link.onClick) {
      link.onClick()
    }
  }

  const keyDownHandler = (e) => {
    if (disabled || !link.onClick) {
      return
    }

    if (e.keyCode === 32) {
      // Spacebar
      e.preventDefault()
    } else if (e.keyCode === 13) {
      // Enter
      e.preventDefault()
      onClick(e)
    }
  }

  const keyUpHandler = (e) => {
    if (disabled || !link.onClick) {
      return
    }

    if (e.keyCode === 32) {
      // Spacebar
      e.preventDefault()
      onClick(e)
    }
  }

  this.addEventListener(\`click\`, onClickHandler)
  this.addEventListener(\`keydown\`, keyDownHandler)
  this.addEventListener(\`keyup\`, keyUpHandler)

  return () => {
    this.removeEventListener(\`click\`, onClickHandler)
    this.removeEventListener(\`keydown\`, keyDownHandler)
    this.removeEventListener(\`keyup\`, keyUpHandler)
  }
}, [disabled, link])

const disableSlotFocus = useMemo(
  () => (e) => {
    e.target.assignedNodes().forEach((el) => {
      if (el instanceof HTMLElement) {
        el.setAttribute(\`tabindex\`, \`-1\`)
        el.addEventListener(\`focus\`, stopPropagation)
      }
    })
  },
  []
)

const onAnchorClick = useMemo(
  () => (e) => {
    if (disabled) {
      // allow no action whatsoever if disabled
      e.preventDefault()
    } else if (!e.ctrlKey && !e.metaKey && link.onClick) {
      // no special keys, treat it as a button click. Don't open link.
      e.preventDefault()
    } else {
      // special keys, don't treat as button click, let browser open link
      e.stopPropagation()
    }
  },
  [disabled]
)

useEffect(() => {
  this.target = link.target || \`_self\`
}, [link])

useEffect(() => {
  this.tabIndex = disabled ? -1 : 0
  this.setAttribute(\`aria-disabled\`, disabled)
  this.classList.toggle(\`disabled\`, disabled)
}, [disabled])

useEffect(() => {
  this.setAttribute(\`role\`, \`button\`)
  if (autoFocus) {
    this.shadowRoot.querySelector(\`.touchable\`).focus()
  }
}, [])

focusTheme = focusTheme || \`normal\`

if (!link.href) {
  return html\`
    <div
      tabindex="-1"
      class="touchable focusTheme-\${focusTheme}"
      @focus=\${stopPropagation}
    >
      <slot @slotchange=\${disableSlotFocus} />
    </div>
  \`
} else {
  return html\`
    <a
      tabindex="-1"
      class="touchable focusTheme-\${focusTheme}"
      @focus=\${stopPropagation}
      href=\${this.href}
      target=\${this.target}
      @click=\${this.onAnchorClick}
    >
      <slot @slotchange=\${disableSlotFocus} />
    </a>
  \`
}
`

export const css = () => `
:host {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  padding: 0 !important; /*Padding must be set on children for focus styling to work as intended*/
  -webkit-tap-highlight-color: transparent;
}

:host(.disabled) {
  cursor: default;
}

:host(:focus) {
  outline: none;
}

:host(:focus) > .touchable.focusTheme-normal {
  box-shadow: 0 0 0 2px var(--primary-color);
}

:host(:focus) > .touchable.focusTheme-thick {
  box-shadow: 0 0 0 3px var(--primary-color);
}

:host(:focus) > .touchable.focusTheme-dark {
  box-shadow: 0 0 0 2px #333;
}

:host(:focus) > .touchable.focusTheme-layered {
  box-shadow: 0 0 0 1px white, 0 0 0 4px var(--primary-color);
}

:host(:focus) > .touchable.focusTheme-purple {
  box-shadow: 0 0 0 2px #e6007e;
}

:host(:focus) > .touchable.focusTheme-none {
  box-shadow: none;
}

.touchable {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: var(--padding);
  border-radius: inherit;
  box-sizing: border-box;
}

.touchable:focus {
  outline: none;
}

::slotted(:focus) {
  outline: none;
}

a,
a:visited,
a:hover {
  color: inherit;
  text-decoration: inherit;
  cursor: inherit;
}
`
