
/**
 * @module errors
 * The module containing various errors. 
 */

/**
 * An error indicating an operation is not supported.
 */
export class UnsupportedError extends Error {

  /**
   * Create a new unsupported error message.
   * @param {string} message The message of the error. 
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}


/**
 * An error indicating the access is prohibited. 
 */
export class AccessError extends Error {

  /**
   * Create a new access error.
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }

}