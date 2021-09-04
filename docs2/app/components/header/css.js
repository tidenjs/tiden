import { css } from "tiden"

export default css`
  :host {
    display: flex;
    align-items: center;
    padding: 10px;
    height: 100%;
    box-sizing: border-box;
  }
  
  menu x-touchable {
    margin: 0 10px;
    text-transform: capitalize;
    font-weight: bold;
  }

  menu x-touchable:hover {
    text-decoration: underline;
  }
`