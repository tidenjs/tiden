import { css } from "tiden"

export default css`
  :host {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .filter {
    display: flex;
    font-size: 12px;
    margin: 6px;
    padding: 6px;
    font-weight: 600;
    border-radius: 2px;
    color: var(--text-color);
  }

  .filter.isSelected {
    color: var(--dust-light);
  }

  .name {
    margin-left: 3px;
  }

  .component.isSelected {
    background-color: var(--part-component);
  }

  .nano.isSelected {
    background-color: var(--part-nano);
  }

  .stream.isSelected {
    background-color: var(--part-stream);
  }

  .page.isSelected {
    background-color: var(--part-page);
  }
`
