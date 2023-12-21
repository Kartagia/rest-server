/**
 * @module temporalTools
 * The tools for handling times.
 */

/**
 * The epoch time determines the number of millisecods from start of the epoch.
 * @typedef {number} EpochTime
 */

/**
 * The epoch day determiens the number of days from the start of epoch.
 * @typedef {number} EpochDay
 */

/**
 * The function determining the value of epoch.
 * @callback EpochTimeFunction
 * @returns {EpochTime} The number of milliseconds from the start of the Epoch.
 */

/**
 * The function determining the day of the epoch.
 * @callback EpochDayFunction
 * @returns {EpochDay} The number of full days days from the start of the Epcoh.
 */

/**
 * The temporal date.
 * @typedef {Object} ITemporalDate
 * @property {number} year The canonical year.
 * @property {number} month The month of year. Starting with index 1.
 * @property {number} day The day of month. Starting withn index 1.
 * @property {string} [reckoning] The reckoning of the date. Defaults to
 * the Gregorian calendar.
 * @property {EpochTimeFunction} valueOf The function determining the epoch time value.
 * @property {EpochDayFunction} epochDay The function determining the epoch day.
 */

/**
 * The temporal time.
 * @typedef {Object} ITemporalTime
 * @property {number} hour The hour of day. 0 based.
 * @property {number} minute The minute of hour. 0 based.
 * @property {number} [second=0] The second of the minute. 0 based.
 * @property {number} [milliseconds=0] The milliseconds of a second. 0 based.
 * @property {string} [timezone="Z"] The timezone of the time. Defaults to UTC+0.
 * @property {Offset} [offset] The time zone offset. Defaults to the offset of the
 * timezone.
 * @property {boolean} hasTimeZone Does the time have timezone. Read-only.
 */

/**
 * The temporal interface implementing both date and time.
 * @typedef {ITemporalDate & ITemporalTime} ITemporalDateTime
 */

/**
 * The time types.
 * - The string values contains ISO UTC DateTime.
 * - The number contains the nanoseconds from the start of the computer
 * epoch "1970-01-01T00:00:00.000Z".
 * @typedef {string|ITemporalDateTime|ITemporalDate|Date|number} ITemporalTypes
 */

const isoDateRegex =
  /(?<year>(?:[-+]\d{2})?\d{4})-(?<month>\d{2})\-(?<day>\d{2})/g;

const isoTimeRegex =
  /(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.(?<milliseconds>\d{1,3}))?(?<zone>Z|UTC(?<hourOffset>[+-]\d{1,2})(?::(?<minuteOffset>\d{2}))?)?/g;

const isoDateTimeRegex = new RegExp(
  isoDateRegex.source + "T" + isoTimeRegex.source,
  "g"
);

/**
 * Get the ISO date regexp.
 * @returns {RegExp} A regular expression matching to the date time starting from the end
 * of last match.
 */
export function getISODateRegexp() {
  return new RegExp(isoDateTimeRegex.source, "f");
}

const dateTimeTypeDefs = [
  ["number", (value) => Number.isInteger(value)],
  [
    "string",
    (value) => {
      const match = isoDateTimeRegex.exec(value);

      return (
        (match &&
          match.index === 0 &&
          match.length === value.length &&
          match.groups.zone === null) ||
        match.groups.zone === "Z" ||
        match.groups.zone === "UTC+0"
      );
    },
  ],
  ["Date", (value) => !Date.isNaN(value)],
  [
    "Object",
    (value) => {
      if (value instanceof Date) {
        return dateTimeTypeDefs["Date"][1](value);
      }
      var result = false;
      if (["year", "month", "day"].every((property) => property in value)) {
        // ITemporalDate
        if (
          ["year", "month", "day"].every((field) =>
            Number.isInteger(value[field])
          )
        ) {
          result = true;
        } else {
          return false;
        }
      }
      if (["hour", "minute", "second"].every((property) => property in value)) {
        // ITemporalTime
        if (
          ["hour", "minute", "second"].every((field) =>
            Number.isInteger(value[field])
          )
        ) {
          result = true;
        } else {
          return false;
        }
      }
      return result;
    },
  ],
];

/**
 * Test the validity of the value type.
 * @param {string} valueType The type of the value.
 * @returns {boolean} True, if the given type is certainly valid value type.
 */
export function validTimeType(valueType) {
  return dateTimeTypeDefs.find((v) => v[0] === valueType) != null;
}

/**
 * The comparison result.
 * - Negative number (<0): The compared was less than the comparee.
 * - Zero (=0): The compared was equal to the comparee.
 * - Positive number (>0): The compared was greaterthan the comparee.
 * - NaN: The comparison result is not defined.
 * @typedef {number} ComparisonResult
 */

/**
 * Get the epoch time of a temporal type.
 * @param {ITemporalTypes} value The value.
 * @returns {EpochTime} The epoch time of hte value, or {@link Number.NaN} if the
 * given value was not a valid temporal value.
 */
export function getEpochTime(value) {
  switch (typeof value) {
    case "string":
      const match = getISODateRegexp().exec(value);
      if (match) {
        if (
          match.groups.zone == null ||
          match.groups.zone === "Z" ||
          match.groups.zone === "UTC+0"
        ) {
          const result = new Date(value);
          return result.valueOf();
        }
      } else {
        return Number.NaN;
      }
    case "number":
      if (Number.isInteger(value)) {
        return value;
      } else {
        return Number.NaN;
      }
    case "object":
      if (value instanceof Date) {
        return Date.valueOf();
      } else if (value instanceof Map) {
      } else if ("epochTime" in value) {
        return value.epochTime();
      } else if ("epochDay" in value) {
        return value.epochDay() * 24 * 3600 * 1000;
      } else {
        const fieldList = ["year", "month", "day"].reduce((result, field) => {
          if (result) {
            if (Number.isInteger(value[field])) {
              result[field] = value[field];
            } else {
              return null;
            }
          } else {
            return result;
          }
        }, {});
        return new Date(fieldList.year, fieldList.month - 1, fieldList.day);
      }
    default:
      return Number.NaN;
  }
}

/**
 * Compare strings.
 * @param {string} compared The compared string.
 * @param {string} comparee The string compared to.
 * @returns {ComparisonResult} The comparison result.
 */
function compareString(compared, comparee) {
  if (typeof compared === "string" && typeof comparee === "string") {
    return compared < comparee ? -1 : compared > comparee ? 1 : 0;
  } else {
    return Number.NaN;
  }
}

/**
 * Compare integer numbers.
 * @param {number} compared The compared number.
 * @param {number} comparee The number compared to.
 * @returns {ComparisonResult} The comparison result.
 */
function compareInt(compared, comparee) {
  if (Number.isInteger(compared) && Number.isInteger(comparee)) {
    return (compared < comparee ? -1 : compared > comparee ? 1 : 0);
  } else {
    return Number.NaN;
  }
}

/**
 * Compare two temporal types.
 * @param {ITemporalTypes} compared The compared time.
 * @param {ITemporalTypes} comparee The time compared to.
 * @returns {ComparisonResult} The comparison result.
 * @throws {TypeError} Either the compared or comparee was invalid.
 */
export function compare(compared, comparee) {
  if (typeof compared === typeof comparee && validTimeType(typeof compared)) {
    // Both are strings or numbers.
    const validator = dateTimeTypeDefs[typeof compared][1];
    if (validator && validator(compared) && validator(comparee)) {
      return compared < comparee ? -1 : compared > comparee ? 1 : 0;
    } else {
      return Number.NaN;
    }
  } else if (
    compared instanceof Date ||
    comparee instanceof Date ||
    validTimeType(typeof compared) ||
    validTimeType(typeof comparee)
  ) {
    // Using the nanoseconds to January 1st 1970 of the outdated time.
    const comparedEpochTime = getEpochTime(compared);
    const compareeEpochTime = getEpochTime(comparee);
    if (Integer.isNaN(comparedEpochTime)) {
      throw new TypeError("Invalid compared");
    } else if (Integer.isNaN(compareeEpochTime)) {
      throw new TypeError("Invalid comparee");
    }
    return comparedEpochTime < compareeEpochTime
      ? -1
      : comparedEpochTime > compareeEpochTime
      ? 1
      : 0;
  } else if (typeof compared === "object" && typeof comparee === "object") {
    const keyList = ["year", "month", "day", "hour", "minute", "second", "millisecond"];
    return keyList.reduce((result, field) => {
      if (result === 0) {
        return compareInt(
          (field in compared ? compared[field] : 0), 
          (field in comparee ? comparee[field] : 0), 
        );
      } else {
        return result;
      }
    }, 0);
  } else {
    throw TypeError("Invalid comparables");
  }
}
