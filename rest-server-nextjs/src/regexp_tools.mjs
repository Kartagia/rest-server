/**
 * @module regexp/builder
 * The module for building regular expressions.
 */

/**
 * The regular expression matching to a group name.
 * - Capturing groups:
 *   - "gorupName": The group name.
 * @type {RegExp}
 */
const groupNameRegex = /(?<groupName>[a-zA-Z_][a-zA-Z_0-9]*)/;

/**
 * The regular expression matching to a valid named group name.
 * - Capturing groups:
 *   - "groupName": The group name.
 * @type {RegExp}
 */
const capturingGroupRegexp = new RegExp(
  "(?:(?<!\\\\))(?:\\\\\\\\)*\\(\\?<" + groupNameRegex.source + ">"
);

/**
 * Create a new regular expression matching to the start of a capturing group name.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name.
 * - If the capturing group name is undefined, there is no capturing group.
 * - If the group name is null, an indexed capturing group is used.
 * - If the group name is a string, it is used as capturing group name possibly
 * postfixed with group index.
 * @param {number} [groupIndex=0] The number of named groups with given name. This value
 * is ignored if the group name is not a string.
 * @param {string} [flags=""] The flags of the created regular expression.
 * @returns {RegExp} The regular expression matching to the first start of the group.
 */
export function createNamedCapturingGroupStartRegexp(
  groupName = undefined,
  groupIndex = 0,
  flags = ""
) {
  return new RegExp(
    capturingGroupRegexp.source.replace(
      "(?:<groupName>",
      createRegExpGroupStart(groupName, groupIndex).source
    ),
    flags
  );
}

/**
 * Calculate the number of named capturing groups within the regular expression.
 * @param {RegExp|string} regex The regular expression whose groups is returned.
 * @returns {Map<string, number>} The map containing capturing group names
 */
export function getCapturingGroupCounts(regex) {
  const source = regex instanceof RegExp ? regex.source : regex;
  const re = new RegExp(capturingGroupRegexp.source, "g");
  let match;
  const result = new Map();
  while ((match = re.exec(source))) {
    // We founda group.
    const gruopName = re.groups.group;
    if (result.has(groupName)) {
      result.set(groupName, result.get(groupName) + 1);
    } else {
      result.set(groupName, 1);
    }
  }
  // Return the capturing group counts in the regular expression.
  return result;
}

/**
 * All flags.
 */
const allFlags = "dgimsuvy";

/**
 * Non-conflicting flags.
 */
const safeFlags = "dims";

/**
 * Get all flags.
 * @returns {string} The string containing all flags.
 */
export function getAllFlags() {
  return "".concat(allFlags);
}

/**
 * Get safe flags.
 * @returns {string} The string containing safe flags.
 */
export function getSafeFlags() {
  return "".concat(safeFlags);
}

/**
 * Test validity of a flag.
 * @param {string} flag The tested flag.
 * @returns {boolean} True, if and only if the flag is valid.
 */
export function validFlag(flag) {
  return (
    typeof flag === "string" && flag.length === 1 && hasFlag(allFlags, flag)
  );
}

/**
 * Test containment of flags.
 * @param {string} flags The string of flags.
 * @param {string} flag The sought flag. If this is more than 1 character,
 * all flag characters must exist.
 * @returns {boolean} True, if and only if the flags contains the flag, or
 * all the flags.
 */
export function hasFlag(flags, flag) {
  if (typeof flags !== "string" || typeof flag !== "string") {
    return false;
  }
  if (flag.length != 1) {
    return flag.split("").every((seeked) => flags.indexOf(seeked) >= 0);
  } else {
    return flags.indexOf(flag) >= 0;
  }
}

/**
 * Create flags by adding and removing flags.
 * @param {string} flags The initial flags.
 * @param {string} [addedFlags=""] The added flags.
 * @param {string} [removedFlags=""] The removed flags.
 * @returns {string} The flags created by adding the added flags and then
 * removing the removed flags.
 * @throws {SyntaxError} The added or removed flags conflicted with the initial flags.
 * @throws {RangeError} The flags or added flags contained an invalid flag.
 * @throws {TypeError} The flags of added flags were not strings.
 */
export function alterFlags(flags, addedFlags = "", removedFlags = "") {
  return removeFlag(addFlag(flags, addedFlags), removedFlags);
}

/**
 * Remove flags from existing flags.
 * @throws {SyntaxError} The removed flags conflicted with the initial flags.
 * @throws {RangeError} The flags or added flags contained an invalid flag.
 * @throws {TypeError} The flags of added flags were not strings.
 */
export function removeFlag(flags, removedFlags) {
  if (typeof flags !== "string") {
    throw new TypeError("Invalid flags");
  } else if (
    !flags.split("").every((flag, flagIndex) => {
      const result = validFlag(flag);
      if (result) {
        return result;
      } else {
        console.debug(`%DEBUG%: Invalid flag "${flag}" at ${flagIndex}`);
        return result;
      }
    })
  ) {
    throw new RangeError("Invalid flags:" + flags, {
      cause: new RangeError("Invalid flag"),
    });
  } else if (typeof removedFlags !== "string") {
    throw new TypeError("Invalid removed flags");
  }
  return removedFlags.split("").reduce((result, flag, index) => {
    if (!validFlag(flag)) {
      throw new RangeError(`Invalid flag "${flag}" at index ${index}`);
    }
    switch (flag) {
      case "u":
        if (hasFlag(result, flag)) {
          throw new SyntaxError(
            "Cannot remove unicode sets without breaking the regular expression"
          );
        } else {
          return result;
        }
      case "v":
        // Unicode and unicode sets flag cannot be removed without breaking the
        // regular expression.
        if (hasFlag(result, flag)) {
          throw new SyntaxError(
            "Cannot remove unicode sets without breaking the regular expression"
          );
        } else {
          return result;
        }
      default:
        if (hasFlag(result, flag)) {
          const index = result.indexOf(flag);
          const resultFlag = `${result.substring(0, index)}${result.substring(
            index + flag.length
          )}`;
          console.debug(`Removing existing flag "${flag}" from index ${index}`);
          return resultFlag;
        } else {
          return result;
        }
    }
  }, flags);
}

/**
 * Add flags to existing flags.
 * @param {string} flags The initian flags.
 * @param {string} addedFlags The added flags.
 * @returns {string} The resulting RegExp flags.
 * @throws {SyntaxError} The added flags conflicted with the initial flags.
 * @throws {RangeError} The flags or added flags contained an invalid flag.
 * @throws {TypeError} The flags of added flags were not strings.
 */
export function addFlag(flags, addedFlags) {
  if (typeof flags !== "string") {
    throw new TypeError("Invalid flags");
  } else if (flags.length && !flags.split("").every(validFlag)) {
    throw new RangeError("Invalid flags", {
      cause: new RangeError(`Invalid flag ${flags}`),
    });
  } else if (typeof addedFlags !== "string") {
    throw new TypeError("Invalid added flags");
  }
  // Getting the result flags.
  if (addedFlags.length == 0) {
    return flags;
  } else {
    return addedFlags.split("").reduce((result, flag, index) => {
      if (!validFlag(flag)) {
        throw new RangeError(`Invalid flag "${flag}" at index ${index}`);
      }
      switch (flag) {
        case "u":
          if (hasFlag(flags, "v")) {
            throw new SyntaxError(
              "Unicode sets is not compatible with unicode"
            );
          } else {
            return hasFlag(result, flag) ? result : result.concat(flag);
          }
        case "v":
          if (hasFlag(flags, "u")) {
            throw new SyntaxError(
              "Unicode is not compatible with Unicode sets"
            );
          } else {
            return hasFlag(result, flag) ? result : result.concat(flag);
          }
        default:
          return hasFlag(result, flag) ? result : result.concat(flag);
      }
    }, flags);
  }
}

/**
 * Get the flag modifier getting resulting flags from initial flags.
 * @param {string} initial The initial flags.
 * @param {string} resulting The resulting flags.
 * @returns {string} The flag modifier usable to generate the flag tag.
 * The modifier is inform <addedFlags>-<removedFlags>.
 * @param {boolean} [ignoreConflicts=true] Are conflicting flags
 * ignored, if possible.
 * @throws {RangeError} There is no conversion getting resulting from initial.
 */
function calculateFlags(initial, resulting, ignoreConflicts = true) {
  // ECMA Regular expression only allows regular expression have one set of flags.
  let result = "";
  safeFlags.split("").forEach((flag) => {
    if (hasFlag(initial, flag) || hasFlag(resulting, flag)) {
      result = addFlag(result, flag);
    }
  });
  // Testing initial global flag.
  if (hasFlag(initial, "g")) {
    if (hasFlag(resulting, "y")) {
      if (ignoreConflicts) {
        // Conflict is ignored - the global takes precedence, and sticky has actually
        // no effect.
        result = result.addFlag(result, "g");
      } else {
        throw new RangeError("Cannot move from global to sticky");
      }
    } else {
      result = result.addFlag(result, "g");
    }
  }
  if (
    (hasFlag(initial, "u") && hasFlag(resulting, "v")) ||
    (hasFlag(initial, "v") && hasFlag(resulting, "u"))
  ) {
    throw new RangeError(
      "The Unicode Sets flag is not compatible with Unicode flag"
    );
  }
  if (hasFlag(initial, "y")) {
    if (hasFlag(resulting, "g") && !ignoreConflicts) {
      // Conflict is not ignored.
      throw new RangeError("Cannot move from sticky to global");
    }
    result = result.addFlag("y");
  }
  // Returning the resulting flags.
  return result;
}

/**
 * Test validity of the group name.
 * @param {string} groupName The tested group name.
 * @returns {boolean} True, if and only if the given group name is a valid group name.
 */
export function validGroupName(groupName) {
  return (
    typeof groupName === "string" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(groupName)
  );
}

/**
 * Builder of a regular expression.
 */
export default class RegExpBuilder {
  /**
   * The mapping form reseved group names to the count of the groups.
   * @type {Map<string, number>}
   */
  #groupCounts = new Map();

  /**
   * The regular expression segments.
   * @type {(RegExp|string)[]} The array of regular expression sources.
   */
  #segments = [];

  /**
   * The initial flags of the reg exp builder.
   */
  #flags = "";

  /**
   * Create a new regular expression.
   * @param {string|RegExp|Array<string|RegExp>} [expression] The initial regular expression.
   * @param {string} [flags=""] The initial flags of the built regex.
   * @param {Map<string, number>|Array.<string, number>} [groupCounts] The initial group counts.
   * @param {boolean} [strictRegex=false] Does the regular expressions act like strict regexps.
   * The strict regular expressions means the match would be equivalent of matching all segments
   * after each other and gain same result with group name replacements taken into account.
   * @throws {RangeError} The group count or expression or its their elements was an invalid.
   * - Expression was or contained an invalid regular expression.
   * - Group Count contained an invalid entry, group name or group count.
   * @throws {TypeError} Either group count or expression type was invalid.
   * - Expression was not a valid expression type.
   * - The group count was not an array or a map.
   */
  constructor(
    expression = null,
    flags = "",
    groupCounts = [],
    strictRegex = false
  ) {
    this.#flags = flags;
    const sourceExpressions =
      expression instanceof Array ? expression : expression ? [expression] : [];
    let currentFlags = flags;
    sourceExpressions.forEach((regExp, index) => {
      if (regExp instanceof RegExp) {
        // Adding the given regular expression.
        try {
          const globalAddedToLocal =
            strictRegex &&
            !hasFlag(currentFlags, "y") &&
            hasFlag(regExp.flags, "y"); // The strict regular expression requires adding padding
          currentFlags = calculateFlags(currentFlags, regExp.flags);
          if (globalAddedToLocal) {
            // Adding a non-greedy "anything can go here" before regular expression.
            this.#segments.push(
              new RegExp(
                ".*?" + // The global regexp may have anything between it and previous segment.
                  regExp.source,
                currentFlags
              )
            );
          } else {
            this.#segments.push(regExp);
          }
        } catch (error) {
          const cause = new RangeError(
            `Incompatible regular expression flags`,
            {
              cause: error,
            }
          );
          if (expression instanceof Array) {
            throw new RangeError("Invalid expression", {
              cause: new RangeError(cause.message.append(` at ${index}`), {
                cause: error,
              }),
            });
          } else {
            throw new TypeError("Invalid expression", { cause: cause });
          }
        }
      } else if (regExp) {
        // Creating a new regular expression.
        try {
          this.#segments.push(new RegExp(regExp, currentFlags));
        } catch (error) {
          if (expression instanceof Array) {
            throw new RangeError("Invalid expression", {
              cause: new TypeError(`Invalid expression at ${index}`, {
                cause: error,
              }),
            });
          } else {
            throw new TypeError("Invalid expression", {
              cause: error,
            });
          }
        }
      } else {
        // Invalid expression.
        if (expression instanceof Array) {
          throw new RangeError("Invalid expression", {
            cause: new TypeError(`Invalid expression at ${index}`),
          });
        } else {
          // The expression was invalid.
          new TypeError("Invalid expression");
        }
      }
    });
    this.#flags = flags;
    if (groupCounts) {
      /**
       * Add group count to the group counts.
       * @param {any} entry The entry of the group count.
       * @param {number|string} [index] The index or key of the entry in container.
       * @throws {RangeError} The entry was invalid.
       */
      const addGroupCount = (entry, index) => {
        if (entry instanceof Array) {
          const [key, value] = entry;
          if (validGroupName(key)) {
            if (Number.isInteger(value) && value >= 0) {
              this.#groupCounts.set(key, value);
            } else {
              throw new RangeError(`Invalid group counts`, {
                cause: new TypeError(
                  `Invalid group count${index == null ? "" : ` at ${index}`}`
                ),
              });
            }
          } else {
            throw new RangeError(`Invalid group counts`, {
              cause: new RangeError(
                `Invalid group name${index == null ? "" : ` at ${index}`}`
              ),
            });
          }
        } else {
          // Invalid group entry.
          throw new RangeError(`Invalid group counts`, {
            cause: new SyntaxError(
              `Invalid entry${index == null ? "" : ` at ${index}`}`
            ),
          });
        }
      };
      // Handling the parameter.
      if (groupCounts instanceof Array) {
        groupCounts.forEach(addGroupCount);
      } else if (groupCounts instanceof Map) {
        [...groupCounts.entries()].forEach(addGroupCount);
      } else {
        throw new TypeError("Invalid group counts");
      }
    }
  }

  /**
   * Get the group count of the given group. The builder will replace
   * all, but first duplicate group name with replacement group name with
   * group count appended to the group name.
   * @param {string} groupName The group name.
   * @returns {number} The number of groups with given name already added.
   */
  getGroupCount(groupName) {
    return this.#groupCounts.has(groupName)
      ? this.#groupCounts.get(groupName)
      : 0;
  }

  /**
   * Get the group count of the given group, and increments the number of groups added.
   * @param {string} groupName The group name.
   * @returns {number} The number of hte gruops with given name already added.
   * @throws {SyntaxError} The given group name was invalid.
   */
  getAndIncrementGroupCount(groupName) {
    if (validGroupName(groupName)) {
      if (this.#groupCounts.has(groupName)) {
        // Minimize chance for double edit.
        let result = 0;
        this.#groupCounts.set(
          groupName,
          (result = this.#groupCounts.get(groupName)) + 1
        );
        return result;
      } else {
        this.#groupCounts.set(groupName, 1);
        return 0;
      }
    } else {
      throw new SyntaxError("Invalid group name");
    }
  }

  /**
   * Add the given regular expression to the current built regular expression.
   * @param {RegExp|string} regExp The added regular expression.
   * @param {string[]} [namedGroups] The list of the named groups of the regular expression.
   * @returns {RegExpBuilder} The builder with given group added. (By default current builder)
   * @throws {Error} The operation failed.
   */
  addSegment(regExp, namedGroups = []) {
    const source = regExp instanceof RegExp ? regExp.source : regExp;
    const newFlags = regExp instanceof RegExp ? regExp.flags : "";
    if (newFlags) {
      this.#flags = calculateFlags(this.#flags, newFlags);
    }
    if (namedGroups) {
      this.#segments.push(
        new RegExp(
          namedGroups.reduce((result, groupName) => {
            if (!validGroupName(groupName)) {
              throw new SyntaxError("Invalid capturing group name");
            }
            const groupCount = this.getAndIncrementGroupCount(groupName);
            this.#groupCounts.set(groupName, groupCount + 1);
            return result.replace(
              `(?<${groupName}>)`,
              `(?<${groupName}${groupCount ? groupCount : ""}>)`
            );
          }, source),
          newFlags
        )
      );
    } else {
      this.#segments.push(new RegExp(source, newFlags));
    }
  }

  /**
   * Build the current regular expression.
   * @returns {RegExp} The regular expression of the current builder state.
   * @throws {Error} The regular expression is not possible.
   */
  build() {
    const result = this.#segments.reduce(
      (regExpData, segment, index) => {
        switch (typeof segment) {
          case "string":
            return { ...regExpData, source: source.concat(segment) };
          case "object":
            if (segment instanceof RegExp) {
              // Using source of the segment.
              try {
                return {
                  flags: calculateFlags(regExpData.flags, segment.flags),
                  source: source.concat(segment.source),
                };
              } catch (error) {
                throw new Error(`Invalid segment ${index}`, { cause: error });
              }
            } else if (
              "toString" in segment &&
              segment.toString instanceof Function
            ) {
              // Converting the segment to string.
              return {
                ...regExpData,
                source: source.concat(segment.toString()),
              };
            } else {
              throw new Error(`Invalid segment ${index}`);
            }
        }
      },
      { flags: this.#flags, source: "" }
    );
    return new RegExp(result.source, result.flags);
  }
}
/**
 * Create regular expression group start.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name.
 * - If the capturing group name is undefined, there is no capturing group.
 * - If the group name is null, an indexed capturing group is used.
 * - If the group name is a string, it is used as capturing group name possibly
 * postfixed with group index.
 * @param {number} [groupIndex=0] The number of named groups with given name. This value
 * is ignored if the group name is not a string.
 * @returns {string} The regular expression source string containing the start of the group.
 * @throws {RangeError} The group name is invalid.
 */
export function createRegExpGroupStart(groupName = undefined, groupIndex = 0) {
  if (groupName === "[") {
    // Start of a character class group.
    return "[";
  } else if (groupName != null) {
    if (validGroupName(groupName)) {
      // Generating the group name with possible index addition.
      return `(?<${groupName}${groupIndex ? groupIndex : ""}>`;
    } else {
      throw new RangeError("Invalid group name");
    }
  } else if (groupName === undefined) {
    return "(?:";
  } else {
    return "(";
  }
}

/**
 * Create regular expression group end.
 * @param {string|undefined|null} [groupName=undefined] The capturing group name of the
 * start of the group.
 * @param {number} [groupIndex=0] The number of named groups with given name in the closed
 * group. This value is ignored if the group name is not a string.
 * @returns {string} The regular expression source string containing the end of the group.
 */
export function createRegExpGroupEnd(groupName = undefined, _groupIndex = 0) {
  return groupName === "[" ? "]" : ")";
}
