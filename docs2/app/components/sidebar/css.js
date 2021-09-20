import { css } from "tiden"

export default css`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    border-right: 1px solid var(--tone-out-2);
  }
  menu {
    list-style: none;
    padding: 0;
  }

  span {
    padding: 10px 16px;
    width: 100%;
    text-transform: capitalize;
    display: block;
    font-weight: bold;
    position: relative;
    border-radius: 4px;
  }

  .selected {
    color: var(--primary-color);
    background-color: #00000007;
  }
`
