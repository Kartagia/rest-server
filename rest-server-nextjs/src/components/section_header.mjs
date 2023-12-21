"use client";

/**
 * @module compontent/sectionHeader
 * The client component of a section header with optional menu.
 */

/**
 * The icon types.
 * @typedef {URL|string} IconTypes
 */

/**
 * The menu item porperties shared by all menu items.
 * @typedef {Object} BaseMenuItemProps
 * @property {IconTypes} [icon] The icon of the menu item.
 * @property {string} [title] The title of the component.
 * @property {string} [ariaTitle] The alternate title used when
 * title is not given. Defaults to the alt-tag of hte icon. This
 * is required if title is absent, and the icon is either absent or
 * does not have alt-information.
 */

/**
 * The properties specific to the action menu items.
 * @typedef {Object} ActionMenuItemProps
 * @property {string} action The triggered action.
 */

/**
 * The properties specific to the link menu items.
 * @typedef {Object} LinkMenuItemProps
 * @property {string|URL} href The destination of the link.
 */

/**
 * A Menu item triggering move to a link.
 * @typedef {BaseMenuItemProps & LinkMenuItemProps} ILinkMenuItem
 */

/**
 * A menu item triggering action.
 * @typedef {BaseMenuItemProps & ActionMenuItemProps} IActionMenuItem
 */

/**
 * The properties specific to the sub menu items.
 * @typedef {Object} SubMenuItemProps
 * @property {MenuItemTypes[]} entries The entries of the sub menu.
 * @property {"popup"|"hideable"|"open"} [menuMode="open"] The menu item mode.
 * @property {"toggle"|"open"|"close"} [headerAction="toggle"] The action performed on click on the
 * menu header. This is meaningful on, if the menu mode is either "popup" or "hideable".
 * @property {boolean} [isOpen=true] Are menu items visible or not.
 * @property {boolean} [closeOnSelect=false] Does the menu close when sub menu item is selected.
 * @property {Function|Function[]} [onCloseListener] The callback, or the callback functions, triggered
 * when submenu is closed.
 * @property {Function|Function[]} [onOpenListener] The callback, or the callback functions, triggered
 * when submenu is opened.
 */

/**
 * A menu item with sub menu.
 * @typedef {BaseMenuItemProps & SubMenuItemProps} ISubMenuItem
 */

/**
 * The menu item definition.
 * @typedef {Object} IMenuItem
 * @property {IconTypes} [icon] The icon of the menu item.
 * @property {string} title The title or caption of the menu item.
 * @property {import("react").ReactElement} [content] The content of the
 * menu item. The content is shown before possible sub menu entries. The 
 * default content is empty.
 */

/**
 * The menu definition.
 * @typedef {Object} IMenu
 * @property {string} title The menu title.
 * @property {string|URL} [icon] The icon on the start of the menu.
 * @property {string} [action] The menu action triggered by the menu.
 */

/**
 * Is the menu definition an action menu definition.
 * @param {IMenu|IMenuItem} menuDefinition The tested definition.
 * @returns {boolean} True, if and only if the menu item is an action menu definition.
 */
function isSubMenuDefinition(menuDefinition) {
  try {
    return ("action" in menuDefinition);
  } catch(error) {
    return false;
  }
}

/**
 * Is the menu definition a link menu definition.
 * @param {IMenu|IMenuItem} menuDefinition The tested definition.
 * @returns {boolean} True, if and only if the menu item is a link menu definition.
 */
function isSubMenuDefinition(menuDefinition) {
  try {
    return ("href" in menuDefinition);
  } catch(error) {
    return false;
  }
}


/**
 * Is the menu definition a sub menu definition.
 * @param {IMenu|IMenuItem} menuDefinition The tested definition.
 * @returns {boolean} True, if and only if the menu item is a sub menu definition.
 */
function isSubMenuDefinition(menuDefinition) {
  try {
    return ("entries" in menuDefinition);
  } catch(error) {
    return false;
  }
}

/**
 *Create a menu component.
 * @param {IMenu|IMenuItem} menuDefinition The menu definition.
 * @param {string|URL} [defaultTarget] The default link of the menu trigger.
 * @param {string} [defaultAction] The default action of the menu trigger.
 */
export function Menu(menuDefinition, defaultAction=undefined, defaultTarget=undefined) {
  if (typeof menuDefinition === "object" && menuDefinition instanceof Object) {
    
    if (isActionMenuDefinition(menuDefinition)) {

    } else if (isSubMenuDefinition(menuDefinition)) {
      // Submenu.
    }
    return (<><li>
        {headerComponent}
        {contentComponent}
        {menuItems.map( (item) => (createMenuItem(item, defaultAction, defaultTarget)))}
      </li></>)
  } else {
    throw new TypeError("Invalid menu definition");
  }
}

export default function SectionHeader(props) {
  const headerContent = props.title ? props.title : <h1></h1>;
  const menuContent = props.menu && (<Menu menuDefinition={props.menu}
    actionListener={props.actionListener}></Menu>);

  return (
    <>
      <header className={"sectionHeader"}>
        {headerContent}
        {menuContent && <nav>{menuContent}</nav>}
      </header>
    </>
  );
}
