/**
 * @module datasource
 *
 * The module implementing data sources.
 */

import { createPath, parsePath, validPath } from "./path.mjs";
import { UnsupportedError, AccessError } from "./errors.mjs";
import { compare as compareTemporal } from "./temporal_tools.mjs";

/**
 * @template RESULT The result type of the promise function.
 * @callback PromiseFunction
 * @returns {Promise<RESULT>} The promise of result.
 */

/**
 * Create an unsupported method function.
 * @template TYPE The type
 * @param {string} methodName The method name.
 * @returns {PromiseFunction<TYPE>} An function which always returns a rejection due an unsupported method.
 */
export function createUnsupportedMethod(methodName) {
  return () =>
    /** @type {Promise<TYPE>} */
    Promise.reject(new UnsupportedError(`Method ${methodName} not supported`));
}

/**
 * The predicate testing a value.
 * @template TYPE The tested type.
 * @callback Predicate
 * @param {TYPE} tested The tested value.
 * @returns {boolean} True, if and only if the tested passes the predicate.
 */

/**
 * A function supplying value of specific type.
 * @template TYPE The supplied value.
 * @callback Supplier
 * @returns {Promise<TYPE>} The promise of the supplied value.
 */

/**
 * Create an unsupported supplier.
 * @template TYPE The type of the supplied value.
 * @param {string} methodName The method name.
 * @returns {Supplier<TYPE>} The unsupported supplier.
 */
export function createUnsupportedSupplier(methodName) {
  return /** @type {Supplier<TYPE>} */ createUnsupportedMethod(methodName);
}

/**
 * A function supplying an array of specific type.
 * @template TYPE The element type.
 * @typedef {Supplier<TYPE[]>} ArraySupplier
 */

/**
 * Create an unsupported array supplier.
 * @template TYPE The type of the supplied value.
 * @param {string} methodName The method name.
 * @returns {Supplier<TYPE[]>} The unsupported array supplier.
 */
export function createUnsupportedArraySupplier(methodName) {
  return /** @type {Supplier<TYPE[]>} */ createUnsupportedMethod(methodName);
}

/**
 * A function supplying a filtered value of specific type.
 * @template TYPE The suppleid type.
 * @callback FilteredByValueSupplier
 * @param {Predicate<TYPE>} filter The filter testing values.
 * @returns {Promise<TYPE[]>} The list of the filtered values.
 */
/**
 * A function supplying a filtered value of specific type by their
 * associated key.
 * @template KEY The type of the key.
 * @template VALUE The supplied value type.
 * @callback FilteredByKeySupplier
 * @param {Predicate<KEY>} filter The filter testing keys.
 * @returns {Promise<VALUE[]>} The list of the filtered values.
 */
/**
 * The function determining the value of a key.
 * @template KEY The key type.
 * @template VALUE the value type.
 * @callback RetrieveFunction
 * @param {KEY} key The key of the queried value..
 * @return {Promise<VALUE>} The promise of a value associated with key.
 * @throws {undefined} The rejection error in the case the key does not have
 * any value associated to it.
 * @throws {UnsupportedError} The rejection error in case that the
 * value function is not supported.
 * @throws {AccessError} The rejection error in case the value access is prohibted.
 */

/**
 * Create an unsupported retrieve function.
 * @template KEY The key type.
 * @template VALUE the value type.
 * @param {string} [methodName] The method name. Defaults to "retrieve".
 * @returns {RetrieveFunction<KEY, VALUE>} The unsupported retrieve function.
 */
export function createUnsupportedRetrieveFunction(methodName = "retrieve") {
  return /** @type {RetrieveFunction<KEY, VALUE>} */ (
    /** @type {KEY} */ _key
  ) => {
    /**
     * The unsupported promise function implementation.
     * @type {PromiseFunction<VALUE>}
     */
    const impl =
      /** @type {PromiseFunction<VALUE>} */ createUnsupportedMethod(methodName);
    return impl();
  };
}

/**
 * The function adding a new entry to the data source.
 * @template KEY The key type.
 * @template VALUE the value type.
 * @callback CreateFunction
 * @param {VALUE} value The new value.
 * @returns {Promise<KEY>} The key associated with the new value.
 * @throws {UnsupportedError} The rejection error in case tha the data source
 * does not allow new values.
 * @throws {TypeError} The reejction error in case the given value was rejected.
 * @throws {AccessError} The rejection error in case the given new value is prohibited
 * for the current user.
 */

/**
 * Create an unsupported create function.
 * @template KEY The key type.
 * @template VALUE the value type.
 * @param {string} [methodName] The method name. Defaults to "create"
 * @returns {CreateFunction<KEY, VALUE>} The unsupported create function.
 */
export function createUnsupportedCreateFunction(methodName = "create") {
  return /** @type {CreateFunction<KEY, VALUE>} */ (
    /** @type {VALUE} */ _value
  ) => {
    /**
     * The unsupported promise function implementation.
     * @type {PromiseFunction<KEY>}
     */
    const impl =
      /** @type {PromiseFunction<KEY>} */ createUnsupportedMethod(methodName);
    return impl();
  };
}

/**
 * The function updating an existing entry.
 * @template KEY The key type.
 * @template VALUE the value type.
 * @callback UpdateFunction
 * @param {KEY} key the key of the updated value.
 * @param {VALUE} value The new value.
 * @returns {Promise<boolean>} The promise of the completion.
 * @throws {UnsupportedError} The rejection error in case tha the data source
 * does not allow new values.
 * @throws {TypeError} The rejection error in case the given value was rejected.
 * @throws {AccessError} The rejection error in case the given update is prohibited.
 */

/**
 * Create an unsupported update function.
 * @template KEY The key type.
 * @template VALUE the value type.
 * @param {string} [methodName] The method name. Defaults to "update".
 * @returns {UpdateFunction<KEY, VALUE>} The unsupported update function.
 */
export function createUnsupportedUpdateFunction(methodName = "update") {
  return /** @type {UpdateFunction<KEY, VALUE>} */ (
    /** @type {KEY} */ _key,
    /** @type {VALUE} */ _value
  ) => {
    /**
     * The unsupported promise function implementation.
     * @type {PromiseFunction<boolean>}
     */
    const impl =
      /** @type {PromiseFunction<boolean>} */ createUnsupportedMethod(
        methodName
      );
    return impl();
  };
}

/**
 * The function removing an existing entry from a data source.
 * @template KEY The key type.
 * @callback DeleteFunction
 * @param {KEY} key The removed key.
 * @returns {Promise<boolean>} The promise of the successful operation.
 * @throws {UnsupportedError} The rejection error in case tha the data source
 * does not support removal of the values.
 * @throws {AccessError} The rejection error in case the given key cannot be removed.
 */

/**
 * Create an unsupported delete function.
 * @template KEY The key type.
 * @param {string} [methodName] The method name. Defaults to "remove".
 * @returns {DeleteFunction<KEY>} The unsupported delete function.
 */
export function createUnsupportedDeleteFunction(methodName = "remove") {
  return /** @type {DeleteFunction<KEY>} */ (/** @type {KEY} */ _key) => {
    /**
     * The unsupported promise function implementation.
     * @type {PromiseFunction<boolean>}
     */
    const impl =
      /** @type {DeleteFunction<boolean>} */ createUnsupportedMethod(
        methodName
      );
    return impl();
  };
}

/**
 * The type of the key-value pairs.
 * @template KEY The key type.
 * @template VALUE The value type.
 * @typedef {Array.<[KEY, VALUE]>} Identified
 */

/**
 * Creates a default keys supplier from retrieve all function.
 * @template KEY The key type.
 * @param {ArraySupplier<Identified<KEY, *>} [retrieveAllFunction] The function
 * returning all key-value-pairs. Defaults to a retrieve all function always returning
 * an empty list.
 */
export function createDefaultKeysSupplier(retrieveAllFunction = undefined) {
  if (retrieveAllFunction) {
    return retrieveAllFunction().then((pairs) => {
      /**
       * @type {Array<KEY>}
       */
      const result = pairs.map(([key, _value]) => key);
      return result;
    });
  } else {
    const result = /** @type {Promise<KEY[]>} */ Promise.resolve(
      /** @type {Key[]}*/ []
    );
    return result;
  }
}

/**
 * Create a default retrieve all function.
 * @template KEY The key type.
 * @template VALUE The value type.
 * @param {ArraySupplier<KEY>} keysFunction The function returning all keys.
 * @param {RetrieveFunction<KEY, VALUE>} retrieveFunction The function retrieving
 * single value.
 * @returns {ArraySupplier<Identified<KEY, VALUE>>} The list of key-value pairs.
 */
export function createDefaultRetrieveAll(keysFunction, retrieveFunction) {
  return () => {
    return new Promise((resolve, reject) => {
      keysFunction().then(
        (keys) => {
          Promise.all(
            keys.map((key) =>
              retrieveFunction(key).catch((error) => {
                reject(
                  new Error(`Could not retrieve value of ${key}`, {
                    cause: error,
                  })
                );
              })
            )
          ).then((values) => {
            resolve(values.map((value, index) => [keys[index], value]));
          });
        },
        (error) => {
          // The retrieve of some key failed.
          reject(new Error(`Could not retrieve all values`, { casue: error }));
        }
      );
    });
  };
}

/**
 * The data source to acquire entries.
 * @template Key The kay type.
 * @template Value The value type.
 * @typedef {Object} IDataSource
 * @property {RetrieveFunction<Key,Value>} retrieve The function returning the value of key.
 * @property {ArraySupplier<Identified<Key, Value>>} retrieveAll The function returning all
 * key-value pairs of the data source.
 * @property {CreateFunction<Key,Value>} create The function returning the a new key associated
 * to a new value stored into the source.
 * @property {UpdateFunction<Key,Value>} update The function updating an existing data entry.
 * @property {DeleteFunction<Key>} remove The function removing an existing data entry.
 * @property {ArraySupplier<Key>} keys The function returning the keys of the data source.
 * @property {FilteredByKeySupplier<Value>} filterByKey The function returing the values
 * with key accepted by the key filter.
 * @property {FilteredByValueSupplier<Value>} filterByValue THe function returning the
 * valeus acceptedb y the value filter.
 * @property {RetrieveFunction<Value,Key>} keyOfValue The function returning the key of value.
 */

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
      (segment) =>
        isLiteralSegment(segment) ||
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
 * Create an unsupproted keys function.
 * @template KEY The key type.
 * @param {string} [methodName] The unsupported method name. Defaults to "keys"
 */
export function createUnsupportedKeysFunction(methodName = "keys") {
  return () => {
    /**
     * @type {ArraySupplier<KEY>}
     */
    const impl = createUnsupportedArraySupplier(methodName);
    return impl();
  };
}

/**
 * An implementation of a data source.
 * @template Key The type of the data source keys.
 * @template Value The tyep of the data source contents.
 * @extends {IDataSource<Key, Value>}
 */
export class DataSource {
  /**
   * Validates the source parameters for Data Source.
   * @param {Partial<IDataSource<Key, Value>>} source The tested source.
   */
  static validSource(source) {
    try {
      this.checkSource(source);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks the data source parameter.
   * @param {Partial<IDataSource<Key, Value>>} source The tested source.
   * @throws {TypeError} The given soruce was not valid source. The cause contains
   * the reason of the failure.
   */
  static checkSource(source) {
    // Check required keys.
    ["retrieve", "keys"].forEach((method) => {
      if (source[method] == null || !(source[method] instanceof Function)) {
        throw new TypeError(
          `Invalid Data Source: Required method ${method} not supported`
        );
      }
    });
    // Checking each key.
  }

  /**
   * Create a new data source.
   * @param {Partial<IDataSource<Key, Value>>} source The source, defining the data source.
   * @throws {TypeError} The given source was not valid source.
   */
  constructor(source={}) {
    DataSource.checkSource(source);

    /**
     * @inheritdoc
     * @type {RetrieveFunction<Key, Value}
     */
    this.retrieve = source.retrieve;
    /**
     * @inheritdoc
     * @type {ArraySupplier<Key>}
     */
    this.keys = source.keys;

    /**
     * @type {ArraySupplier<Identified<Key,Value>>}
     */
    this.retrieveAll =
      source.retrieveAll || createDefaultRetrieveAll(this.keys, this.retrieve);

    /**
     * @inheritdoc
     * @type {UpdateFunction<Key,Value>}
     */
    this.update = source.update || createUnsupportedUpdateFunction();
    this.remove = source.remove || createUnsupportedDeleteFunction();
    this.create = source.create || createUnsupportedCreateFunction();
    this.filterByKey =
      source.filterByKey ||
      (async (filter) => {
        return this.retrieveAll().then((entries) =>
          entries.filter(([key]) => filter(key)).map(([_key, value]) => value)
        );
      });
    this.filterByValue =
      source.filterByValue ||
      (async (filter) => {
        return this.retrieveAll().then((entries) =>
          entries
            .filter(([_key, value]) => filter(value))
            .map(([_key, value]) => value)
        );
      });

    /**
     * @type {RetrieveFunction<Value, Key>}
     */
    this.keyOfValue =
      source.keyOfValue ||
      (async (/** @type {Value} */ value) => {
        return this.retrieveAll().then(
          (/** @type {Array<Identified<Key,Value>>} */ entries) => {
            const resultIndex = entries.findIndex(
              (identified) => identified[0] === value
            );
            if (resultIndex >= 0) {
              const result = entries[resultIndex][0];
              return result;
            } else {
              /**
               * The rejection result.
               * @type {Promise<Key>}
               */
              const rejection = /** @type {Promise<Key>} */ new Promise(
                (_, reject) => {
                  reject({ error: 404 });
                }
              );
              return rejection;
            }
          }
        );
      });
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
      .map((path) =>
        createPath([...this.#basePath.segments, ...path.segments])
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

/**
 * The storage type.
 * @template [Key=string], [Value=any]
 * @typedef {Map<Key, Value>} DataStorage
 */

/**
 * Parameters related to the data storage items.
 * @template [Key=string], [Value=any]
 * @typedef {Object} EntriesParams
 * @property {Predicate<Value>} [validValue] The validator of the values.
 * @property {DataStorage<Key,Value>} [entries=[]] The entries of the data storage.
 * @property {Supplier<Key>} [idGenerator] The key generator generating the next new
 * key for created value. If undefined, creation of new values is not supported.
 */

/**
 * Class representing a memory data source storing data into memory.
 * @template Key, Value
 * @extends {DataSource<Key, Value>}
 */
export class MemoryDataSource extends DataSource {
  /**
   * The map containing the data.
   */
  #content;

  /**
   * The parameters for defining the create parameters.
   * @template KEY
   * @template VALUE
   * @typedef {Object} CreateParams
   * @property {Supplier<Key>} idGenerator The generator of the identifiers.
   * @property {Predicate<Value>} [valueValidator] The validator of the value.
   */

  /**
   * Create a new memory storage data source from given parameters.
   * @param {EntriesParams<Key, Value> & CreateParams<Key,Value>} parameters The construction parameters.
   */
  constructor(parameters) {
    /**
     * The map of the elements.
     * @type {Map<Key, Value>}
     */
    const content = Map();

    /**
     * The function retrieving the value.
     * @type {RetrieveFunction<Key,Value>}
     */
    const retrieve = (id) => {
      return new Promise((resolve, reject) => {
        if (content.has(id)) {
          // Resolve with value of the id.
          resolve(content.get(id));
        } else {
          // Not found - returns undefined rejection.
          reject();
        }
      });
    };
    /**
     * The retrieve all implementation.
     * @type {ArraySupplier<Identified<Key,Value>>}
     */
    const retrieveAll = () => {
      return [...content.entries()].map(([key, value]) => [key, value]);
    };

    if (parameters.readOnly) {
      // Creating a read only data source.
      super({
        ...parameters,
        retrieve,
        retrieveAll,
        update: undefined,
        create: undefined,
        remove: undefined,
      });
      /**
       * @type {Supplier<Key>}
       */
      this.generateId = createUnsupportedSupplier("generateId");
      this.validValue = parameters.validValue || ((value) => (value != null))
    } else {
      /**
       * The generator of the identifiers.
       * @type {Supplier<Key>}
       */
      const idGenerator =
        parameters.idGenerator ||
        new Promise((_resolve, reject) => {
          reject(new UnsupportedError("Identifier generation not supported"));
        });

      /**
       * The validator of the values.
       * @type {Predicate<Value>}
       */
      const valid = parameters.validValue || ((value) => value != null);

      /**
       * @type {UpdateFunction<Key,Value>}
       */
      const update = (id, value) => {
        return new Promise((resolve, reject) => {
          if (content.has(id)) {
            if (valid(value)) {
              // Valid value.
              content.set(id, value);
              resolve(true);
            } else {
              // Invalid value.
              reject(new TypeError("Invalid value"));
            }
          } else {
            // The not found situation.
            resolve(false);
          }
        });
      };

      /**
       * The create function for the data source.
       * @type {CreateFunction<Key,Value>}
       */
      const create = (value) => {
        return new Promise((resolve, reject) => {
          valid(value).then((validity) => {
            if (validity) {
              idGenerator().then(
                (id) => {
                  // Adding the new value to the content.
                  content.set(id, value);
                  resolve(id);
                },
                (error) => {
                  reject(
                    new UnsupportedError("Could not create new identifier", {
                      cause: error,
                    })
                  );
                }
              );
            } else {
              reject(new TypeError("Invalid value"));
            }
          }, reject);
        });
      };

      /**
       * @type {DeleteFunction<Key>}
       */
      const remove = (id) => {
        return new Promise((resolve, reject) => {
          if (content.has(id)) {
            try {
              resolve(content.delete(id));
            } catch (error) {
              reject(
                new AccessError("Could not remove the element", {
                  cause: error,
                })
              );
            }
          } else {
            resolve(false);
          }
        });
      };

      super({
        ...parameters,
        retrieve,
        create,
        update,
        remove,
        retrieveAll,
      });
      /**
       * @type {Supplier<Key>}
       */
      this.generateId = idGenerator;
    }

    // At this point the super constructor is called. 
    this.#content = content;

    // Adding entries.
    if (parameters?.entries) {
      if (parameters.entries instanceof Map) {
        [...parameters.entries.entries()].forEach(([key, value]) => {
          if (this.validValue(value)) {
            this.#content.set(key, value);
          } else {
            throw new TypeError("Invalid initial entries", {
              cause: new TypeError(`Invalid value for ${key}`)})
          }
        });
      }
    }
  }
}
