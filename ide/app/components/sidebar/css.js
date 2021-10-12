import { css } from "tiden"

export default css`
  :host {
    display: flex;
    flex-direction: column;
    border-right: 1px solid gray;
  }

  .child > .self {
    display: flex;
    padding: 3px;
  }

  .children {
    display: flex;
    flex-direction: column;
    padding-left: 20px;
  }

  .expander,
  .icon {
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    text-align: center;
  }

  .expander {
    color: var(--arrow-color);
    cursor: initial;
  }

  .name {
    color: var(--dust);
    font-family: Roboto;
    font-weight: 400;
  }

  .theme-white {
    background-color: #ccc;
  }

  .theme-gray {
    background-color: var(--dust-light);
  }

  .theme-earth {
    background-color: var(--earth-light);
  }
`
