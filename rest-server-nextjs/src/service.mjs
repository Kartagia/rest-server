
/**
 * @module service
 * The module containing models and data types
 * of the services linking data sources to paths
 */

import { createPath } from "./path.mjs";
import { compareSegmentLists } from "./service.mjs";



/**
 * Function determining the data source key.
 * @template [Key=string]
 * @callback KeyFunction
 * @param {Map<string, import("./path.mjs").PathParameter<any>>} source The converted
 * map of path parameters.
 * @param {RegExpExecArray} pathMatch The match of the path.
 * @returns {Promise<Key>} The promise of the key for the given path parameter mapping.
 */
/**
 * Test whether the given segment is a literal segment.
 * @param {import("./path.mjs").PathSegmentTypes} segment The tested segment.
 * @returns {boolean} True, if and only if the given segment is a literal
 * segment.
 */
function isLiteralSegment(segment) {
  return typeof segment === "string" || segment instanceof String;
}
/**
 * Test whether the given segment is a parameter segmetn.
 * @param {import("./path.mjs").PathSegmentTypes} segment The tested segment.
 * @returns {boolean} True, if and only if the given segment is a parameter
 * segment.
 */
function isParameterSegment(segment) {
  return (
    segment instanceof Object &&
    !(segment instanceof Array) &&
    segment.type &&
    segment.paramName
  );
}
/**
 * Test whether the given segment is a mixed segment.
 * @param {import("./path.mjs").PathSegmentTypes} segment The tested segment.
 * @returns {boolean} True, if and only if the given segment is a mixed
 * segment.
 */
function isMixedSegment(segment) {
  return (
    segment instanceof Array &&
    segment.every(
      (segment) => isLiteralSegment(segment) ||
        isParameterSegment(segment) ||
        isMixedSegment(segment)
    )
  );
}
/**
 * Default comparison.
 * @template TYPE
 * @param {TYPE} a The compared value.
 * @param {TYPE} b The value compared with.
 * @returns {import("./temporal_tools.mjs").ComparisonResult} The comparison result.
 */
const defaultComparison = (a, b) => {
  try {
    return a < b ? -1 : a > b ? 1 : 0;
  } catch (error) {
    return Number.NaN;
  }
};
/**
 * Compare parameter types.
 * @param {import("./path.mjs").PathParameterTypes} compared The compared paramter type.
 * @param {import("./path.mjs").PathParameterTypes} comparee The parameter type compared with.
 * @returns {import("./temporal_tools.mjs").ComparisonResult} The comparison result.
 */

export function compareParameterTypes(compared, comparee) {
  const order = ["parameter", "catchall", "optional"];
  const comparedKey = order.indexOf(compared);
  const compareeKey = order.indexOf(comparee);
  if (comparedKey >= 0 && compareeKey >= 0) {
    return defaultComparison(comparedKey, compareeKey);
  } else {
    return Number.NaN;
  }
}
/**
 * Compare Path segments.
 * @param {import("./path.mjs").PathSegmentTypes} compared
 * @param {import("./path.mjs").PathSegmentTypes} comparee
 * @return {number|undefined} The Comparison result.
 */

export function compareSegment(compared, comparee) {
  if (isLiteralSegment(compared)) {
    return isLiteralSegment(comparee)
      ? defaultComparison("" + compared, "" + comparee)
      : -1;
  } else if (isParameterSegment(compared)) {
    return isLiteralSegment(comparee)
      ? 1
      : isMixedSegment(comparee)
        ? comparee.length && isLiteralSegment(comparee[0])
          ? 1
          : compared.length === 0
            ? 1
            : compareSegment(compared, comparee[0])
        : compareParameterTypes(compared.type, comparee.type);
  } else if (isMixedSegment(compared)) {
    if (isMixedSegment(comparee)) {
      return compareSegmentLists(compared, comparee);
    } else {
      return compared.length === 0 ? 1 : compareSegment(compared[0], comparee);
    }
  } else {
    return Number.NaN;
  }
}
/**
 * Compare two lists of segments.
 * @param {Array<import("./path.mjs").PathSegmentTypes>} compared The compared segment list.
 * @param {Array<import("./path.mjs").PathSegmentTypes>} comparee The segment list compared with.
 * @return {import("./temporal_tools.mjs").ComparisonResult} The comparison result.
 */

export function compareSegmentLists(compared, comparee) {
  const validCompared = isMixedSegment(compared);
  const validComparee = isMixedSegment(comparee);
  if ((validCompared, validComparee)) {
    const compareeCount = compared.length;
    const comparedCount = compared.length;
    const end = Math.min(comparedCount, compareeCount);
    for (let i = 0; i < end; i++) {
      const result = compareSegment(compared[i], comparee[i]);
      if (result === undefined || result) {
        // Returning result.
        return result;
      }
    }
    // The default length is determined by the larger segment count first.
    return defaultComparison(compareeCount, comparedCount);
  } else {
    // Comparison result is not defined.
    return Number.NaN;
  }
}
/**
 * Service links paths to the data sources.
 */

export class Service {
  /**
   * The root service path.
   * @type {import("./path.mjs").ServicePath}
   */
  #basePath;

  /**
   * The data sources registered to the path.
   * @type {Map<ServicePath, DataSource>}
   */
  #dataSources = new Map();

  /**
   * The key functions of the the paths.
   * @type {Map<ServicePath, KeyFunction<any>}
   */
  #keyFunctions = new Map();

  /**
   * Cerate a new service.
   * @param {import("./path.mjs").ServicePath} [path] The service path.
   * Defaults to the root service path.
   */
  constructor(path = undefined) {
    if (path) {
      this.#basePath = path;
    } else {
      this.#basePath = {
        absolute: true,
        regex: new RegExp(""),
        segments: [],
        parameters: new Map(),
      };
    }
  }

  /**
   * Add data source to the service.
   * @template [Key=string]
   * @template [Value=any]
   * @param {import("./path.mjs").ServicePath} path The internal service path.
   * @param {KeyFunction<Key>} keyFunction The fuction converting
   * path parameters into data source key.
   * @param {DataSource<Key, Value>} dataSource The data source serving the
   * path.
   * @throws {RangeError} The given path was already reserved.
   */
  addDataSource(path, keyFunction, dataSource) {
    if (this.#dataSources.has(path)) {
      throw new RangeError("Cannot replace an existing data source");
    } else {
      this.#dataSources.set(path, dataSource);
      this.#keyFunctions.set(path, keyFunction);
    }
  }

  /**
   * Get the service paths recognized by the service.
   * The paths are in the order of search (longest literal first).
   * @return {Array<import("./path.mjs").ServicePath>}
   */
  getServicePaths() {
    return [...this.#dataSources.keys()]
      .sort(
        (
        /** @type {import("./path.mjs").ServicePath*/ a,
            /** @type {import("./path.mjs").ServicePath*/ b
        ) => compareSegmentLists(a.segments, b.segments)
      )
      .map((path) => createPath([...this.#basePath.segments, ...path.segments])
      );
  }

  /**
   * Get the data source of the local path url.
   * @template Key, Value
   * @param {string} path The tested path.
   * @returns {DataSource<Key,Value>?} The data source matching the path.
   */
  getDataSource(path) {
    const servicePath = this.findServicePath(path);
    return this.#dataSources.get(servicePath);
  }

  /**
   * Find service path for a path.
   * @param {string} path The tested local path.
   * @returns {ServicePath?} The service path of the matching path.
   */
  findServicePath(path) {
    return this.getServicePaths().find((tested) => {
      const match = tested.regex.exec(path);
      return match && match.index === 0;
    });
  }

  /**
   * Get the key function for the path.
   * @tmeplate Key The key type.
   * @param {string} path The local URL path.
   * @returns {KeyFunction<Key>?} The key function of the path.
   */
  getKeyFunction(path) {
    const servicePath = this.findServicePath(path);
    return this.#keyFunctions.get(servicePath);
  }

  /**
   * Get the resource by path.
   *
   * @tempalte Value
   * @param {import("./path.mjs").ServicePath} path The service path.
   * @returns {Promise<Value>} The promise of the service
   * path.
   */
  getResourceByPath(path) {
    const servicePath = this.findServicePath(path);
    if (servicePath) {
      const keyDefiner = this.#keyFunctions.get(servicePath);
      const dataSource = this.#dataSources.get(servicePath);
      const match = servicePath.regex.exec(path);
      const key = keyDefiner(servicePath.parameters, match);
      return dataSource.retrieve(key);
    } else {
      return Promise.reject({ error: 404 });
    }
  }
}

