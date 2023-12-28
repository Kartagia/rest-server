/**
 * @module path
 * The module containing path related methods and data types.
 */

import { UnsupportedError } from "./errors.mjs";
import {
  addFlag,
  createRegExpGroupStart,
  createRegExpGroupEnd,
  validGroupName,
} from "./regexp_tools.mjs";

/**
 * Create escaped regular expression source.
 * @param {string} literal The literal regular expression to escape.
 * @returns {string} The regular expression source producing the literal
 * string.
 */
export function escapeRegExp(literal) {
  return literal.replaceAll(/(?<escaped>[.\[\(\)\+?*\-\\/\]])/g, "\\$<escaped>");
}

/**
 * The service path type.
 * @typedef {Object} ServicePath
 * @property {boolean} absolute Is the path absolute or relative.
 * @property {PathSegmentTypes[]} segments The segments of the path.
 * @property {Map<string, string>} parameters The mappign from segment
 * parameters to their values.
 */

/**
 * The recongized path types.
 * @typedef {string|ServicePath} PathTypes
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
 *   - "delimiter": The end delimiter.
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
      "(?<delimiter>\\/|$)" +
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
 * The function determining the path parameter value.
 * @template [TYPE=string] The parameter value type.
 * @callback PathParamValueFunction
 * @param {RegExpExecArray} match The regular expression execution result.
 * @returns {TYPE|undefined} The path parameter value, if it exists in the match,
 * or an undefined value.
 */

/**
 * The parameter types of the path parameters.
 * @typedef {"optional"|"catchall"|"parameter"} PathParameterTypes
 */

/**
 * The path parameter definition.
 * @template [TYPE=string] The parameter value type.
 * @typedef {Object} PathParameter
 * @property {PathParameterTypes} type The type of the path parameter.
 * @property {PathParamValueFunction<TYPE>} value The function determining
 * the value of the path parameter from the path regular expression execution
 * results.
 */

/**
 * Create a simple parameter value function returning the parameter value string.
 * @param {string} paramName The parameter name.
 * @returns {PathParamValueFunction<string>} The function returning the parameter value.
 */
export function createSimplePathParamValueFunction(paramName) {
  return createPathParamValueFunction(
    paramName,
    (/** @type {string} */ str) => str
  );
}

/**
 * Create path parameter value function.
 * @template [TYPE=string]
 * @param {string} paramName The parameter name.
 * @param {Parser<TYPE>} paramParser The parser parsing the value to the default value.
 * @returns {PathParamValueFunction<TYPE>} The function
 */
export function createPathParamValueFunction(paramName, paramParser) {
  return (/** @type {RegExpExecArray?} */ match) => {
    if (match instanceof Array && match.groups && match.groups[paramName]) {
      // We do have execution array.
      return paramParser(match.groups[paramName]);
    } else {
      // Match
      return undefined;
    }
  };
}

/**
 * @typedef {string} PathLiteralSegment The literal segment of the path.
 */

/**
 * @template [TYPE=string]
 * @callback Parser
 * @param {string} source The parsed string.
 * @returns {TYPE} The parsed value.
 * @throws {SyntaxError} The parse failed due invalid source.
 * @description
 * Converts a string into a value. If the source is not a valid
 * string representation of the type, throws an exception.
 */

/**
 * @template [TYPE=string]
 * @callback Stringifier
 * @param {TYPE} value The converted value.
 * @returns {string} The string representing the value in the URL.
 * @description Converts value into the URL representation of the value.
 */

/**
 * A path parameter segment represents a segment only containing a parameter value.
 * @template [TYPE=string] The type of the parameter value.
 * @typedef {Object} PathParameterSegment The segment containing path parameter.
 * @property {string} paramName The name of the parameter.
 * @property {PathParameterTypes} type The type of the parameter.
 * @property {Parser<TYPE>} parser The parser parsing the value of the parameter.
 * @property {Stringifier<TYPE>} toString The function converting the path parameter
 * value to the string sequence in the url.
 */

/**
 * A mixed parameter segment contains both parameter and literal segmetns.
 * @typedef {Array<PathLiteralSegment|PathParameterSegment<any>>} PathMixedSegment
 */

/**
 * The segment types of the path segments.
 * @typedef {PathLiteralSegment|PathParameterSegment|PathMixedSegment} PathSegmentTypes
 */

/**
 * Create a path.
 * @param {PathSegmentTypes[]} segments... The path segments.
 * @returns {ServicePath} The service path of the given segments.
 * @throws {SyntaxError} Any segment was invalid.
 */
export function createPath(...segments) {
  const result = {
    segments: [...segments],
    regex: undefined,
    parameters: /** @type {Object.<string, PathParameter<any>>} */ {},
  };
  let flags = "y";
  let regExpString = "";
  segments.forEach((segment, index) => {
    regExpString = regExpString.concat("\\/");
    if (typeof segment === "string" || segment instanceof String) {
      regExpString = regExpString.concat(escapeRegExp("" + segment));
    } else if (segment instanceof Object) {
      if (segment instanceof Array) {
        // We do have a mixed segment.
        regExpString = regExpString.concat(
          segment
            .map(
              (
                /** @template TYPE @type {PathParameterSegment<TYPE>} */ segmentPart
              ) => {
                if (segmentPart.constructor === String) {
                  return escapeRegExp("" + segmentPart);
                } else if (result.parameters[segmentPart.paramName]) {
                  // Test if the parameter type is invalid.
                  if (
                    result.parameters[segmentPart.paramName].type !==
                    segmentPart.type
                  ) {
                    // Invalid segment - duplicate parameter name with different type.
                    throw new SyntaxError("Invalid path", {
                      cause: new RangeError(
                        `Duplicate parameter ${segmentPart.paramName} at index ${index}`
                      ),
                    });
                  }
                  // The parameter exists.
                  return `\\k<${segmentPart.paramName}>`;
                } else {
                  result.parameters[segmentPart.paramName] =
                    createPathParamValueFunction(
                      segmentPart.paramName,
                      segmentPart.parser
                    );
                  return `(?<${segmentPart.paramName}>[^\\/]+?)`;
                }
              }
            )
            .join("")
        );
      } else if (
        segment.type &&
        segment.type.constructor === String &&
        typeof segment.paramName === "string" &&
        segment.parser instanceof Function
      ) {
        // Single path.
        if (result.parameters[segment.paramName]) {
          // Test if the parameter type is invalid.
          if (result.parameters[segment.paramName].type !== segment.type) {
            // Invalid segment - duplicate parameter name with different type.
            throw new SyntaxError("Invalid path", {
              cause: new RangeError(
                `Duplicate parameter ${segment.paramName} at index ${index}`
              ),
            });
          }
          // The parameter exists.
          regExpString = regExpString.concat(`\\k<${segment.paramName}>`);
        } else {
          result.parameters[segment.paramName] = createPathParamValueFunction(
            segment.paramName,
            segment.parser
          );
          regExpString = regExpString.concat(`(?<${segment.paramName}>[^\\/]+?)`);
        }
      } else {
        // Invalid element.
        console.table(segment);
        throw new SyntaxError("Invalid segments", {
          cause: TypeError(`Invalid segment at ${index}`),
        });
      }
    } else {
      throw new SyntaxError("Invalid path", {
        cause: new TypeError(`Invalid segment at index${index}`),
      });
    }
  });

  try {
    result.regex = new RegExp(regExpString, addFlag(flags, "y"));
  } catch (error) {
    throw new SyntaxError("Invalid path", {
      cause: new SyntaxError("Invalid path regular expression", {
        cause: error,
      }),
    });
  }
  return result;
}

/**
 * Parse a path into Path object.
 * @param {string} pathString The parsed path string.
 * @returns {ServicePath} The path object representing the given path.
 */
export function parsePath(pathString) {
  if (validPath(pathString)) {
    const regex = createPathSegmentRegexp("segment");
    const absolute = pathString.substring(0, 1) === "/";
    const result = {
      absolute,
      segments: (absolute ? pathString.substring(1) : pathString).split("/"),
      parameters: {},
    };
    result.parameters = result.segments.reduce((params, segment) => {
      let match;
      let index = 0;
      if ((match = regex.exec(segment)) && match.groups.segment == segment) {
        // Constructing the regular expression matching to the path string and
        // the parameter definitions for the path.
        const segmentPartsRegex = createLiteralOrVariableRegex();
        let paramOrLiteral,
          partIndex = 0;
        const segmentRegexp = "";
        while ((paramOrLiteral = segmentPartsRegex.exec(segment))) {
          if (paramOrLiteral.groups.literal) {
            // We have literal.
            segmentRegexp = segmentRegexp.concat(
              escapeRegExp(paramOrLiteral.groups.literal)
            );
          } else if (paramOrLiteral.groups.opt_param) {
            // OPtional capture all.
            throw new SyntaxError(
              `Invalid path segment at index ${partIndex}`,
              new UnsupportedError(
                "Optional catch-all parameters are not supported"
              )
            );
            // Zero or more parameter segments.
            const paramName = paramOrLiteral.groups.opt_param;
            if (result.parameters[paramName]) {
              // Duplicate value
              if (result.parameters[paramName] !== "optional") {
                throw new SyntaxError("Invalid path", {
                  cause: SyntaxError(
                    `Duplicate parameter name ${paramName} at segment ${partIndex}`
                  ),
                });
              } else {
                // Adding link to previous segment requiring same sequence.
              }
            } else {
              // Adding new parameter.
              segmentRegexp = segmentRegexp.concat(
                `(?<${paramName}>(?:[^\\/]+(?:\\/|$))*?)`
              );
              result.parameters[paramName] = {
                type: "optional",
                value: (match) =>
                  match.groups[paramName]
                    ? match.groups[paramName]
                        .split("/")
                        .filter((part) => part.length)
                    : [],
              };
            }
          } else if (paramOrLiteral.groups.all_param) {
            // CatchAll parameter segment.
            throw new SyntaxError(
              `Invalid path segment at index ${partIndex}`,
              new UnsupportedError("Catch-all parameters are not supported")
            );

            // One o rmore parameter segments.
            const paramName = paramOrLiteral.groups.all_param;
            segmentRegexp = segmentRegexp.concat(
              `(?<${paramName}>(?:${
                partIndex == 0 ? "^" : "\\/"
              })[^\\/]+(?=\\/|$))*?)`
            );
            result.parameters[paramName] = {
              type: "catchall",
              value: (match) =>
                match.groups[paramName]
                  .split("/")
                  .filter((part) => part.length),
            };
          } else {
            // We have a single parameter.
            const type = "parameter";
            const paramName = paramOrLiteral.groups.param;
            if (result.parameters[paramName]) {
              if (result.parameters[paramName].type !== type) {
                // The path is invalid.
                throw new SyntaxError(`Invalid path`, {
                  cause: new SyntaxError(
                    `Duplicate parameter name ${paramName} at segment ${partIndex}`
                  ),
                });
              } else {
                // Adding back reference to the existing parameter value
                // (the default expects same parameter value stays constants)
                segmentRegexp = segmentRegexp.concat(`\\k<${paramName}>`);
              }
            } else {
              // Adding new parameter definition.
              segmentRegexp = segmentRegexp.concat(
                `(?<${paramName}>(?:${partIndex == 0 ? "^" : "\\/"})[^\\/]+?)`
              );
              result.parameters[paramName] = {
                type,
                value: (match) => match.groups[paramName],
              };
            }
          }
          partIndex++;
        }
        result.regexp = segmentRegexp;

        if (match.groups.variable) {
          const delimiter = match.groups.delimiter;
          if (delimiter) {
            // The delimtier is invalid - the segment should not have dash.
            throw SyntaxError(`Invalid path segment`, {
              cause: new SyntaxError(
                `Invalid delimiter ${delimiter} at segment ${index}`
              ),
            });
          }
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
        index++;
      } else {
        // Invalid segment.
        throw new SyntaxError(`Invalid segment at index ${index}`);
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
