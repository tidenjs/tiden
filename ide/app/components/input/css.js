import { css } from "tiden"

export default css`
  :host {
    display: block;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 16px;
    padding: 10px;
    margin-bottom: 10px;
  }

  input:focus {
    outline: none;
    border: none;
    box-shadow: 0 0 10px var(--dust);
  }
`
