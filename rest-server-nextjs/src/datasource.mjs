/**
 * @module datasource
 *
 * The module implementing data sources.
 */

import { parsePath, validPath } from "./path.mjs";
import { UnsupportedError, AccessError } from "./errors.mjs";

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
    Promise.reject(new UnsupportedError(`Method ${methodName} not supported`));
}

/**
 * A function supplying value of specific type.
 * @template TYPE The supplied value.
 * @callback Supplier
 * @returns {Promise<TYPE>} The promise of the supplied value.
 */
/**
 * A function supplying an array of specific type.
 * @template TYPE The element type.
 * @typedef {Supplier<TYPE[]>} ArraySupplier
 */
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
 * @throws {UnsupportedError} The rejection error in case that the
 * value function is not supported.
 * @throws {AccessError} The rejection error in case the value access is prohibted.
 */
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
 * The function removing an existing entry from a data source.
 * @template KEY The key type.
 * @callback DeleteFunction
 * @param {KEY} key The removed key.
 * @returns {Promise<boolean>} The promise of the successful operation.
 * @throws {UnsupportedError} The rejection error in case tha the data source
 * does not support removal of the values.
 * @throws {AccessError} The reejction error in case the given key cannot be removed.
 *//**
 * The data source to acquire entries.
 * @template Key The kay type.
 * @template Value The value type.
 * @typedef {Object} IDataSource
 * @property {PathTypes} path The path of the data source including params.
 * @property {RetrieveFunction<Key,Value>} retrieve The function returning the value of key.
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
 * An implementation of a data source.
 * @template Key The type of the data source keys.
 * @template Value The tyep of the data source contents.
 * @extends {IDataSource<Key, Value>}
 */
export class DataSource {

  /**
   * The Path of the server.
   * @type {ServicePath}
   */
  #path;

  /**
   * Create a new data source.
   * @param {Partial<IDataSource<Key, Value>>} source The source, defining the data source.
   * @throws {TypeError} The given source was not valid source.
   */
  constructor(source) {
    // Handling required properties.
    if ("path" in source) {
      if (typeof source.path === "string" || validPath(source.path)) {
        this.path = path;
        this.#path = parsePath(source.path);
      } else {
        throw new TypeError(
          `Invalid Data Source: Invalid required porperty path`
        );
      }
    } else {
      throw new TypeError(
        `Invalid Data Source: Required porperty path missing`
      );
    }

    // Handling required method keys.
    ["retrieve", "keys"].forEach((method) => {
      if (source[method] == null || !(source[method] instanceof Function)) {
        throw new TypeError(
          `Invalid Data Source: Required method ${method} not supported`
        );
      } else {
        this[method] = source[method];
      }
    });

    // Handling the optional keys.
    [
      // Methods with Promise<Value> results.
      ...["create", "retrieve"].map((method) => [
        method,
        /** @type { PromiseFunction<Value> } */ (
          createUnsupportedMethod(method)
        ),
      ]),
      // Methdos with Promise<boolean> results
      ...["delete", "update"].map((method) => [
        method,
        /** @type { PromiseFunction<boolean> } */ (
          createUnsupportedMethod(method)
        ),
      ]),
      // Methods with Promise<Value[]> results.
      ...["filterByKey", "filterByValue"].map((method) => [
        method,
        /** @type { PromiseFunction<Value[]> } */ (
          createUnsupportedMethod(method)
        ),
      ]),
      // Values with key specific default values.
      [
        "filterByKey",
        /** @type {FilteredByKeySupplier<Key,Value>} */ (filter) => {
          return new Promise((resolve, reject) => {
            if (filter instanceof Function) {
              this.getKeys().then((keys) => {
                try {
                  resolve(
                    keys.filter(filter).map(async (key) => {
                      const resultVal = await this.retrieve(key);
                      return resultVal;
                    })
                  );
                } catch (error) {
                  reject(new RangeError("Invalid key filter"));
                }
              });
            } else {
              reject(new TypeError("Invalid key filter."));
            }
          });
        },
      ],
      [
        "filterByValue",
        /** @type {FilteredByValueSupplier<Value>} */ (filter) => {
          return new Promise((resolve, reject) => {
            if (filter instanceof Function) {
              this.getKeys().then((keys) => {
                try {
                  resolve(
                    keys
                      .map(async (key) => {
                        const resultVal = await this.retrieve(key);
                        return resultVal;
                      })
                      .filter(filter)
                  );
                } catch (error) {
                  reject(new RangeError("Invalid value filter"));
                }
              });
            } else {
              reject(new TypeError("Invalid value filter"));
            }
          });
        },
      ],
      [
        "keyOfValue",
        /** @type {RetrieveFunction<Value, Key>} */ (
          (value) => {
            return new Promise((resolve, reject) => {
              this.keys().then((keys) => {
                // This is possibly doable with Promise.some - check it out later.
                const result = keys.find(
                  async (key) => (await this.retrieve(key)) === value
                );
                if (result == null) {
                  reject();
                } else {
                  resolve(result);
                }
              });
            });
          }
        ),
      ],
    ].forEach(
      ([
        /** @type {string} */ method,
        /** @type {Function?} */ defaultValue = null,
      ]) => {
        // A null and undefined value of method is considered as non-existing.
        if (method in source && source[method] != null) {
          if (source[method] instanceof Function) {
            this[method] = source[method];
          } else {
            throw new TypeError(
              `Invalid Data source: Invalid optional method ${method}.`
            );
          }
        } else {
          this[method] = defaultValue || createUnsupportedMethod(method);
        }
      }
    );
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
 * @property {DataStorage<Key,Value>} [entries=[]] The entries of the data storage.
 * @property {Supplier<Key>} [keyGenerator] The key generator generating the next new
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
  #content = Map();

  /**
   * Create a new memory storage data source from given parameters.
   * @param {Omit<IDataSource<Key, Value>, retrieve,create,update,remove,filterByKey,filterByValue,keyOfValue> & EntriesParams<Key, Value>} parameters The construction parameters.
   */
  constructor(parameters) {
    super({
      ...parameters,
      keys: keysImplementation,
      retrieve: retrieveImplementation,
    });
    this.keyGenerator = /** @type {(Supplier<Key>?)} */ parameters.keyGenerator;
    if (parameters?.entries) {
      if (parameters.entries instanceof Map) {
        [...parameters.entries.entries()].forEach(([key, value]) => {
          // TODO: Add validation of the entry.
          this.#content.set(key, value);
        });
      }
    }

    /**
     * The implementation of the keys function.
     * @returns {Promise<Key[]>}
     */
    const getKeys = () => {
      return Promise.resolve([...this.#content.keys()]);
    };

    /**
     * The implementation of the retrive funciton.
     * @param {Key} key The key of the queried value.
     * @returns {Promise<Value>} The promise of the value of the key.
     */
    const getValue = (key) => {
      if (this.#content.has(key)) {
        return Promise.resolve(this.#content.get(key));
      } else {
        return Promise.reject();
      }
    };

    /**
     * The implementation of the keys passable for the superclass.
     * @returns {Promise<Key[]>} The keys of the data source.
     */
    function keysImplementation() {
      return getKeys();
    }

    /**
     * The implemenation of the value retrieval for passing to
     * the superclass.
     * @param {Key} key The key of the retrieved value.
     * @returns {Promise<Value>} The promise of the value
     * associated with the key.
     */
    function retrieveImplementation(key) {
      return getValue(key);
    }

    // Defining the interface methods for the optional methods.
    this.create = (value) => {
      return new Promise((resolve, reject) => {
        if (this.keyGenerator) {
          // Validating the value.
          // TODO: Validation of the data.

          // Creating result.
          const result = this.keyGenerator();
          this.#content.set(result, value);
          resolve(result);
        } else {
          // Calling the default implementation indicating unsupported operation.
          reject(super.create(key));
        }
      });
    };
    this.update = (key, value) => {
      return Promise((resolve, reject) => {
        if (this.#content.has(key)) {
          // Validating the value.
          // TODO: Validation of the data.
          // Updating the result.
          this.#content.set(key, value);
          resolve(true); // The value was updated.
        } else {
          // Not found.
          reject();
        }
      });
    };
    this.remove = (key) => {
      return Promise((resolve, reject) => {
        if (this.#content.delete(key)) {
          resolve(true);
        } else {
          reject();
        }
      });
    };
    this.filterByKey = /** @type {FilteredByKeySupplier<Key, Value>} */ (
      filter
    ) => {
      return new Promise((resolve, reject) => {
        if (filter instanceof Function) {
          try {
            // First filter keys, and then retrieve the key values.
            resolve(
              this.keys().then((result) =>
                result.filter(filter).map((key) => this.#content.get(key))
              )
            );
          } catch (error) {
            reject(
              new RangeError("Key filter could not handle all entries!", {
                cause: error,
              })
            );
          }
        } else {
          reject(TypeError("Key filter must be a predicate"));
        }
      });
    };
    this.filterByValue = /** @type {FilteredByValueSupplier<Value>} */ (
      filter
    ) => {
      return new Promise((resolve, reject) => {
        if (filter instanceof Function) {
          try {
            resolve(
              this.keys().then((result) =>
                result.map((key) => this.#content.get(key)).filter(filter)
              )
            );
          } catch (error) {
            reject(
              new RangeError("The value filter could not handle all entries!", {
                cause: error,
              })
            );
          }
        } else {
          reject(TypeError("The value filter must be a predicate"));
        }
      });
    };
  }
}
