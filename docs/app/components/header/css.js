import { css } from "tiden"

export default css`
  :host {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: var(--tone-out-1);
  }

  menu x-touchable {
    margin: 0 10px;
    font-weight: bold;
  }

  menu x-touchable:hover {
    text-decoration: underline;
  }
`
