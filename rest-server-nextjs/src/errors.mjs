
/**
 * @module errors
 * The module containing various errors. 
 */

/**
 * @typedef {Object} ValidationErrorOptions
 * @property {Error} [cause] The error causing the exception.
 * @property {string} [target] The invalid resource or property name.
 */

/**
 * A validation error indicates something was invalid.
 */
export class ValidationError extends Error {

  /**
   * Create a new validation error.
   * @param {string} message 
   * @param {ValidationErrorOptions} [options] 
   */
  constructor(message, options={}) {
    super(message, {cause: options.cause});
    this.name = this.constructor.name;
    this.target = options.target;
  }
}

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