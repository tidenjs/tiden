import { css } from "tiden"

export default css`
  menu {
    list-style: none;
    padding: 0;
  }
  li {
    //padding: 5px;
    margin: 5px 0;
  }

  x-touchable {
    width: 100%;
  }
  
  span {
    text-transform: capitalize;
    padding: 5px;
    text-decoration: underline;
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 5px;
    font-weight: bold;
    position: relative;
  }
  
  span:after {
    content: '';
    position: absolute;
    left: -3px;
    display: block;
    top: 0;
    width: 0px;
    height: 100%;
    background-color: var(--primary-color);
  }

  span.selected:after, span:hover:after {
    width: 3px;
  }
`