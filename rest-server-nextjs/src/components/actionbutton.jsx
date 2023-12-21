
/**
 * Create a new action button.
 * @param {string} caption The caption of input button.
 * @param {EventListener} [onClick] The on click event listener. if undefined, the button
 * will be disabled.
 * @param {string} [value] The value of the button. Defaults to the caption.
 * @returns {import("react").JSXElementConstructor} THe React Component impolementing the
 * action button.
 */
export default function ActionButton({caption, onClick = undefined, value = undefined}) {

  return (<><input type="button" disabled={(onClick == null)}
  value={(value || caption)} onClick={onClick}>{caption}</input>
  </>);
}