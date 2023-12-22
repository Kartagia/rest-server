/**
 * @module path
 * The module containing path related methods and data types.
 */

import {
  createRegExpGroupStart,
  createRegExpGroupEnd,
  validGroupName,
} from "./regexp_tools.mjs";

/**
 * The recongized path types.
 * @typedef {string} PathTypes
 */

/**
 * Append child path to the parent path.
 * @param {PathTypes} parent The parent path.
 * @param {PathTypes} child THe child path.
 * @return {PathTypes} The path of the parent type with child appended.
 */
export function appendPath(parent, child) {
  switch (typeof parent) {
    case "string":
      if (validPath(child)) {
        const childStr = child.toString().replace(RegExp("(?:^\\/)", "g"), "");
        return parent
          .replace(new RegExp("(?:\\/$)", "g"), "")
          .concat("/", childStr);
      } else {
        throw new TypeError("Invalid child");
      }
    default:
      throw new TypeError("Invalid parent");
  }
}

/**
 * Test validity of the path.
 * @param {PathTypes} path The tested path.
 */
export function validPath(path) {
  switch (typeof path) {
    case "string":
      return pathRegularExpression.test(path);
    default:
      return false;
  }
}

/**
 * A log entry.
 * @typedef {Object} LogEntry
 * @property {import("./temporal_tools.mjs").ITemporalTypesemporalTypes} time The time of the log entry.
 * @property {string} message The message of the log entry.
 * @property {string} [dataSource] The name of the datasource.
 * @property {string} [method] The method of the logged request.
 * @property {string} [source] The source of the logged entry. This is the source URL.
 * @property {string} [sourceBody] The body of the source request.
 * @property {string} [target] The target of the logged entry. This is the target URL.
 * @property {string} [targetBody] The body of the target response.
 */
/**
 * A regular expression matching to a literal segment part.
 * The matched literal part is captured into named group "literal".
 * @type {RegExp}
 */
const literalRegex = new RegExp("(?<literal>[\\w+.\\-]+)", "g");
/**
 * The regular expresion matching to a path segment parameter placeholder.
 * The name of the matched parameter is captured into named group "param".
 * The regular expression matches to both catch-all, and catch single parameter
 * placeholders.
 * @return {RegExp}
 */
const parameterNameRegex = new RegExp("(?<param>[a-zA-Z]\\w*)", "g");
/**
 * The regular expression matching to a string containing only a valid path
 * parameter name.
 */
const pathParameterNameRegex = new RegExp(
  "^" + parameterNameRegex.source + "$",
  "y"
);
/**
 * Test whether a string is a valid parameter name.
 * @param {string} tested The tested parameter name.
 * @returns {Boolean} True, if and on ly if the tested is a valid parameter name.
 */
export function validPathParameterName(tested) {
  return validGroupName(tested);
}
/**
 * Create new parameter regex, and update the counter.
 * @param {string} parameterName The placeholder parameter name.
 * @param {number} [count=0] The number of parameter groups with
 * given parameter name in the regular expression. Defaults to 0.
 * @param {string} [flags="g"] The flags of the created regular expression.
 * Defaults to "g".
 * @return {RegExp} The regular expression matching to the
 */
export function getParameterNameRegexp(parameterName, count, flags = "") {
  if (typeof parameterName !== "string") {
    throw new TypeError("Invalid parameter name: Not a string");
  } else if (parameterName == null || validPathParameterName(parameterName)) {
    return new RegExp(
      parameterNameRegex.source.replace(
        "(?<param>",
        createRegExpGroupStart(parameterName, count)
      ),
      flags
    );
  } else {
    throw new RangeError("Invalid parameter name " + parameterName);
  }
}
/**
 * The regular expression matching to a path parameter.
 * - The regular expression will capture the name of the placeholder
 * into named group "param", "optParams", or "params".
 */
const pathParameterRegex = new RegExp(
  "(?:" +
    "(?:\\[\\[\\.\\.\\." +
    getParameterNameRegexp("opt_param").source +
    "\\]\\])" +
    "|" +
    "(?:\\[\\.\\.\\." +
    getParameterNameRegexp("all_param").source +
    "\\])" +
    "|" +
    "(?:\\[" +
    getParameterNameRegexp("param").source +
    "\\])" +
    ")",
  "g"
);
let literalCount = 0;
let paramCount = 0;

/**
 * Create a literal regexp.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name.
 * - If the capturing group name is undefined, there is no capturing group.
 * - If the group name is null, an indexed capturing group is used.
 * - If the group name is a string, it is used as capturing group name possibly
 * postfixed with group index.
 * @param {number} [groupIndex=0] The number of named groups with given name. This value
 * is ignored if the group name is not a string.
 * @param {string} [flags="g"] The flags fo the created regular expression.
 * @returns {RegExp} The regular expression matching to a literal part of the segment.
 * If ht e
 */
export function createLiteralRegexp(
  groupName = undefined,
  groupIndex = null,
  flags = "g"
) {
  return new RegExp(
    literalRegex.source.replace(
      "(?<literal>",
      createRegExpGroupStart(groupName, groupIndex)
    ),
    flags
  );
}

/**
 * Create a regular expression matching with parameter placeholder within a segment.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name.
 * - If the capturing group name is undefined, there is no capturing group.
 * - If the group name is null, an indexed capturing group is used.
 * - If the group name is a string, it is used as capturing group name possibly
 * postfixed with group index.
 * @param {number} [groupIndex=0] The number of named groups with given name. This value
 * is ignored if the group name is not a string.
 * @param {string} [flags="y"] The flags fo the created regular expression.
 * @returns {RegExp} The regular expression matching to a parameter placeholder of the segment.
 * Reserved groups:
 * - If the group name is a string:
 *   - groupName: The single parameter match.
 *   - "opt_" + groupName: The parameter is an optional catch all parameter.
 *   - "all_" + groupName: The parameter is a catch all parameter. 
 *   - If the groupIndex is greater than 0 the group index is appended to the group
 *     names.
 */
export function createParameterRegexp(
  groupName = undefined,
  groupIndex = null,
  flags = "y"
) {
  const optGroupName = groupName != null ? `opt_${groupName}` : groupName;
  const listGroupName = groupName != null ? `all_${groupName}` : groupName;
  return new RegExp(
    pathParameterRegex.source
      .replaceAll("(?<param>", createRegExpGroupStart(groupName, groupIndex))
      .replaceAll(
        "(?<opt_param>",
        createRegExpGroupStart(optGroupName, groupIndex)
      )
      .replaceAll(
        "(?<all_param>",
        createRegExpGroupStart(listGroupName, groupIndex)
      ),
    flags
  );
}

/**
 * Create a regular expression matching to either a literal value or a
 * parameter definition. The dynamic segment may be optional catch all, catch all,
 * or a single parameter declaring.
 * @param {string} [groupPrefix=""] The prefix added to each group name.
 * @returns {RegExp} A regular expression which will match either to a literal
 * segment or a dynamic segment.
 * - The returning parameter captures the literal part into `${groupPrefix}literal` appended
 * with the literal count, if it is greater than 0.
 * - The returning parameter captures the parameter name part into `${groupPrefix}param`
 * appended with the parameter count, if it is greater than 0.
 */
export function createLiteralOrVariableRegex(groupPrefix = "") {
  return new RegExp(
    "(?:" +
      createLiteralRegexp(`${groupPrefix}literal`, literalCount++).source +
      "|" +
      createParameterRegexp(`${groupPrefix}param`, paramCount++).source +
      ")",
    "gu"
  );
}

/**
 * The regular expression matching to either the literal part of the section, or to
 * a parameter definition section.
 *
 * - The result groups for type parameter defintion groups:
 *   - "optArrayVariable": The name of a variable containing zero or more parameter values.
 *   - "arrayVariable": The name of a variable containing array of one or more parameter values.
 *   - "variable": The name of a variable containing a single paramter value.
 * - The litearal element defiintion groups:
 *   - "literal": The litearal section content.
 */
export const literalOrVariableRegex = createLiteralOrVariableRegex();
/**
 * Path segment regualr expession.
 * - Reserved groups:
 *   - "segment": The segemnt content.
 */
const pathSegmentRegex = new RegExp(
  "(?<segment>" +
    createParameterRegexp(undefined).source +
    "?" +
    "(?:" +
    createLiteralRegexp(undefined).source +
    createParameterRegexp(undefined).source +
    ")*" +
    createLiteralRegexp(undefined).source +
    "?" +
    ")",
  "gu"
);

/**
 * Create a new path segment matching regular expression.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name.
 * - If the capturing group name is undefined, there is no capturing group.
 * - If the group name is null, an indexed capturing group is used.
 * - If the group name is a string, it is used as capturing group name possibly
 * postfixed with group index.
 * @param {number} [groupIndex=0] The number of named groups with given name. This value
 * is ignored if the group name is not a string.
 * @param {string} [flags="y"] The flags fo the created regular expression.
 * @returns {RegExp} The regular expression matching a path segment.
 * - Reserved groups:
 *   - "absolute": Defined, if the path segment is an absolute path segment.
 *   - "segment": The last matchign segment content without initial or following separator.
 */
export function createPathSegmentRegexp(
  groupName = undefined,
  groupIndex = 0,
  flags = "y"
) {
  return new RegExp(
    "(?:" +
      "(?<absolute>\\/)?" +
      pathSegmentRegex.source.replace(
        "(?<segment>",
        createRegExpGroupStart(groupName, groupIndex)
      ) +
      "(?:\\/|$)" +
      ")",
    flags
  );
}
/**
 * The regular expression matching to a full path.
 * - Reserved groups:
 *   - "root": The root determining whether the path is absolute or not.
 *   - {@link pathSegmentRegex} reserverd groups.
 */
export const pathRegex = new RegExp(
  "^" + createPathSegmentRegexp(undefined).source + "*" + "$",
  "gu"
);

/**
 * Parse a path into Path object.
 * @param {string} pathString The parsed path string.
 * @returns {Path} The path object representing the given path.
 */
export function parsePath(pathString) {
  if (validPath(pathString)) {
    const regex = new RegExp(literalOrVariableRegex.source, "fu");
    const result = {
      absolute: pathString.substring(0, 1) === "/",
      segments: pathString.split("/"),
      parameters: {},
    };
    result.parameters = result.segments.reduce((params, segment) => {
      let match;
      while ((match = regex.exec(segment))) {
        if (match.groups.variable) {
          const varName = match.groups.variable;
          const typeDef = match.groups.typeDef
            ? {
                type: match.groups.type | "string",
                validator: match.groups.validator,
              }
            : { type: "string" };
          if (varName in params) {
            if (params[varName] instanceof Array) {
              params[varName].push(typeDef);
            } else {
              params[varName] = [params[varName], typeDef];
            }
          } else {
            params[varName] = typeDef;
          }
        }
      }
    }, {});
  } else {
    throw new TypeError("Invalid path");
  }
}

/**
 * The regular expression matching to a valid path segment character.
 * @type {RegExp}
 */
const pathSegmentCharacterRegex = RegExp(
  createRegExpGroupStart(undefined) +
    "(?:[a-zA-Z0-9~._\\-])" + // Unescaped character.
    "|" +
    "(?:%[a-fA-F0-9]{2})" + // Query escape sequence.
    createRegExpGroupEnd(undefined),
  ""
);

export function createPathSegmentCharactersRegex(
  groupName = undefined,
  groupIndex = 0,
  flags = "y"
) {
  const actualGroupName =
    groupName && groupIndex ? groupName + groupIndex : groupName;
  return RegExp(
    createRegExpGroupStart(actualGroupName) +
      pathSegmentCharacterRegex.source +
      "*" +
      createRegExpGroupEnd(groupName),
    flags
  );
}

/**
 *
 * @param {string|undefined|null} groupName The caputring group name caputirng the
 * query value (or variable).
 * @param {number} [groupIndex=0] The number of groups with the same group name within
 * the final regular expression. This is only used with named capturing group.
 * @param {string} [flags="y"] The flags of the created regular expression.
 * @returns {RegExp} The regular expression matching to a query variable name or value, which
 * is captured into the capturing group according the groupName.
 */
export function createQueryValueRegexp(
  groupName = undefined,
  groupIndex = 0,
  flags = "y"
) {
  return new RegExp(
    createRegExpGroupStart(groupName, groupIndex) +
      "(?:" +
      "(?:[a-zA-Z0-9~._\\-])" + // Unescaped character.
      "|" +
      "(?:%[a-fA-F0-9]{2})" + // Query escape sequence.
      ")*" + 
      createRegExpGroupEnd(groupName, groupIndex),
    flags
  );
}
/**
 * Create a new url query section matching regular expression.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name.
 * - If the capturing group name is undefined, there is no capturing group.
 * - If the group name is null, an indexed capturing group is used.
 * - If the group name is a string, it is used as capturing group name possibly
 * postfixed with group index.
 * @param {number} [groupIndex=0] The number of named groups with given name. This value
 * is ignored if the group name is not a string.
 * @param {string} [flags="y"] The flags fo the created regular expression.
 * @returns {RegExp} The regular expression matching a path segment.
 * - Reserved groups:
 *   - "absolute": Defined, if the path segment is an absolute path segment.
 *   - "segment": The segment content without initial or following separator.
 */

export function createQueryRegexp(
  groupName = undefined,
  groupIndex = 0,
  flags = "y"
) {
  return new RegExp(
    createRegExpGroupStart(groupName, groupIndex) +
      createQueryValueRegexp() +
      "=" +
      createQueryValueRegexp() +
      "?" +
      "(?:&|$)" + // Follwed by either end of string or separator.
      ")+$",
    flags
  );
}
/**
 * Regular expression matching to a path with query parameters at end.
 * - Reserved capturing groups:
 *   - "segments": The segments of the path.
 *   - "query": The query parameters of the path.
 * @type {RegExp}
 */
const pathWithQueryRegex = new RegExp(
  "^" +
    "(?<segments>" +
    createPathSegmentRegexp(undefined).source +
    "*" +
    ")" +
    "(?:\\?" +
    createQueryRegexp("query") +
    ")?" +
    "$",
  "gu"
);
