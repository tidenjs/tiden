import { css } from "tiden"

export default css`
  :host {
    border-radius: 2px;
    display: block;
    height: 15px;
    width: 3px;
  }

  div {
    width: 100%;
    height: 100%;
  }

  .component {
    background-color: var(--part-component);
  }

  .stream {
    background-color: var(--part-stream);
  }

  .nano {
    background-color: var(--part-nano);
  }

  .component {
    background-color: var(--part-component);
  }
`
