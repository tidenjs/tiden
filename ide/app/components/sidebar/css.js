import { css } from "tiden"

export default css`
  :host {
    display: flex;
    flex-direction: column;
    border-right: 1px solid gray;
  }

  .part {
    display: flex;
    padding: 3px;
  }

  .expander,
  .icon {
    width: 20px;
    height: 20px;
    padding-right: 5px;
    text-align: center;
  }

  .expander {
    color: var(--arrow-color);
    cursor: initial;
  }
`
