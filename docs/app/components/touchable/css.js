import { css } from "tiden"

export default css`
  
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
    box-shadow: 0 0 0 1px white, 0 0 0 4px var(--primar-color);
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