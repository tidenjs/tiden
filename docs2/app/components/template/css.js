import { css } from "tiden"

export default css`
  :host {
    display: grid;
    grid-template-areas: "header header" "sidebar main";
    grid-template-rows: 60px 1fr;
    grid-template-columns: minmax(200px, max-content) 1fr;
    height: 100%;
  }
  
  #header {
    grid-area: header;
    box-shadow: 0px 0px 5px 0px #000;
    border-radius: 5px;
  }

  #sidebar {
    grid-area: sidebar;
    padding: 10px;
    box-shadow: 40px 0px 5px -40px #000;
  }
  
  #main {
    grid-area: main;
    padding: 10px;
    overflow: hidden;
    overflow-y: auto;
  }
`