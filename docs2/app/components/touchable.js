import { html, component, useEffect, useMemo } from "tiden"

import css from "./touchable/css.js"

component(`x-touchable`, { css }, function touchable({ language, link: originalLink, disabled, focusTheme, autoFocus }) {
  
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
  
    this.addEventListener(`click`, onClickHandler)
    this.addEventListener(`keydown`, keyDownHandler)
    this.addEventListener(`keyup`, keyUpHandler)
  
    return () => {
      this.removeEventListener(`click`, onClickHandler)
      this.removeEventListener(`keydown`, keyDownHandler)
      this.removeEventListener(`keyup`, keyUpHandler)
    }
  }, [disabled, link])
  
  const disableSlotFocus = useMemo(
    () => (e) => {
      e.target.assignedNodes().forEach((el) => {
        if (el instanceof HTMLElement) {
          el.setAttribute(`tabindex`, `-1`)
          el.addEventListener(`focus`, stopPropagation)
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
    this.tabIndex = disabled ? -1 : 0
    this.ariaDisabled = disabled
    this.classList.toggle(`disabled`, !!disabled)
  }, [disabled])
  
  useEffect(() => {
    this.setAttribute(`role`, `button`)
    if (autoFocus) {
      this.shadowRoot.querySelector(`.touchable`).focus()
    }
  }, [])
  
  focusTheme = focusTheme || `normal`
  
  if (!link.href) {
    return html`
      <div
        tabindex="-1"
        class="touchable focusTheme-${focusTheme}"
        @focus=${stopPropagation}
      >
        <slot @slotchange=${disableSlotFocus} />
      </div>
    `
  } else {
    return html`
      <a
        tabindex="-1"
        class="touchable focusTheme-${focusTheme}"
        @focus=${stopPropagation}
        href=${link.href}
        target=${link.target}
        @click=${onAnchorClick}
      >
        <slot @slotchange=${disableSlotFocus} />
      </a>
    `
  }
  
})