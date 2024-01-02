import { DataSource } from "../src/datasource.mjs";
import { ValidationError } from "../src/errors.mjs";
import { expect, should, use } from "chai";
import chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);

/**
 * @module test/junit/datasource
 * JUNIT-testi datasource luokan objektille.
 */

/**
 * Logs the given values to the log.
 * @callback LogFunction
 * @param {any[]} param... The outputted values.
 * @throws {Error} Any parameter was not stringifiable.
 */

/**
 * Starts a log group.
 * @callback GroupStartFunction
 * @param {any[]} param... The group heading.
 * @throws {Error} Any parameter was not stringifiable.
 */

/**
 * Closes a log group.
 * @callback GroupEndFunction
 */

/**
 * Logger objectt performs a logging.
 * @typedef {Object} BaseLogger
 * @property {LogFunction} log The logging of a message.
 * @property {LogFunction} error The logging of an error message.
 * @property {LogFunction} info The logging of an info message.
 * @property {LogFunction} debug The logging of a debug message.
 * @property {LogFunction} table Log a table.
 * @property {GroupStartFunction} group Start a log group.
 * @property {GroupEndFunction} groupEnd Close a log group.
 */

/**
 * Starts the timer with given name.
 * @callback TimerStartFunction
 * @param {string} [timerName="default"] The timer name.
 */

/**
 * End the timer with given name.
 * @callback TimerEndFunction
 * @param {string} [timerName="default"] The timer name.
 */

/**
 * Stops the time with labe.
 * @param {string} [timerName="default"] The stopped timer name.
 */

/**
 * Logs the timer label and the timer current value followed by the parameters.
 * @callback TimerLogFunction
 * @param {string} [timerName="deault"] The timer name
 * @param {any[]} params... The logged data.
 */

/**
 * Logger of times.
 * @typedef {Object} TimeLogger
 * @property {TimerStartFunction} time Starts a timer.
 * @property {TimerEndFunction} timeEnd Stops a timer.
 * @property {TimerLogFunction} timeLog Logs a timer current value.
 */

/**
 * @typedef {BaseLogger & TimeLogger} Logger
 */

/**
 * Test create data source.
 * @template [Key=string] The type of the data source values.
 * @template [Value=string] The type of the data source values.
 * @param {Logger} [logger] The logger used to log the messages. Defaults
 * to console.log.
 * @param {Partial<import("../src/datasource.mjs").IDataSource<Key, Value>>} [source] The
 * tested data source.
 * @param {Map<Key, Value>} [validResources] The valid test cases mapping from
 * data source path to the data source value.
 */
export async function testCreateDataSource(
  logger = console.log,
  source = {},
  validResources = []
) {
  try {
    const tested = new DataSource(source);
    [...validResources.keys()].forEach((resourceId) => {
      tested
        .retrieve(resourceId)
        .then((value) => {
          const comparee = validResources.get(resourceId);
          if (typeof comparee !== typeof value) {
            throw new ValidationError(
              `Invalid resource type: expected ${typeof comparee}, got ${typeof value}`,
              { target: resourceId }
            );
          }
          switch (typeof value) {
            case "object":
              if (value instanceof Object.getPrototypeOf(comparee)) {
                // Check more accurate content.
                expect(value).include(comparee, "Invalid resource value");
              } else {
                // The test fails.
                throw new ValidationError(
                  `Invalid resource class: expected ${Object.getPrototypeOf(
                    comparee
                  )}, got ${Object.getPrototypeOf(value)}`,
                  { target: resourceId }
                );
              }
              break;
            case "number":
              if (Number.isNaN(comparee)) {
                if (Number.isNaN(value)) {
                  return true;
                } else {
                  throw new ValidationError(
                    `Invalid resource value: expected NaN, got ${value}`,
                    { target: resourceId }
                  );
                }
              } else if (comparee !== value) {
                throw new ValidationError(
                  `Invalid resource value: expected ${comparee}, got ${value}`,
                  { target: resourceId }
                );
              } else {
                return true;
              }
            case "symbol":
              if (comparee !== value) {
                throw new ValidationError(
                  `Invalid resource value: expected a different symbol`,
                  { target: resourceId }
                );
              } else {
                return true;
              }
            case "string":
            case "boolean":
            case "undefined":
            case "null":
            default:
              if (comparee !== value) {
                throw new ValidationError(
                  `Invalid resource value: expected ${comparee}, got ${value}`,
                  { target: resourceId }
                );
              } else {
                return true;
              }
          }
        })
        .catch((error) => {
          throw new ValidationError("Missing expected resource", {
            target: resourceId,
            cause: error,
          });
        });
    });
    logger.info(`Test passsed`);
  } catch (error) {
    logger.error(`Test failed: ${error}`);
    throw Error("Test failed on DataSource", { cause: error });
  }
}

// Running the tests.
describe("DataSources", () => {
  it("Default data source", () => {
    /**
     * @type {DataSource<string, string>}
     */
    let tested;
    expect(() => {
      tested = new DataSource();
    }).throw(TypeError);
  });

  const generateKeySequence = (first = 1, last = 100, timeOut = 50) => {
    const result = [];
    let goOn = true;
    const timeout = setTimeout(() => {
      goOn = false;
    }, timeOut);
    for (let i = first; i < last && goOn; i++) {
      result.push(i);
    }
    clearTimeout(timeout);
    return result;
  };

  const keys = generateKeySequence(1, 1000, 50);

  const validDataSourceConstructions = [
    [
      {
        retrieve: (id) =>
          Number.isInteger(id) ? Promise.retrieve(id) : Promise.reject(),
        keys: () => {
          return Promise.resolve(keys);
        },
      },
      [["retrieveAll", [], keys]],
      "Readonly numbers from 1 to 1000"
    ],
    [
      {
        entries: new Map(
          ["Battle", "Discipline"].map((skillName) => [
            skillName,
            { skillName },
          ])
        ),
        retrieve: (id) => new Promise((resolve, reject) => {}),
        keys: () =>
          new Promise((resolve, _reject) => {
            resolve([...this.entries.keys()]);
          }),
        create: (skill) => {
          return new Promise((resolve, reject) => {
            if (
              skill instanceof Object &&
              "skillName" in skill &&
              typeof skillName === "string"
            ) {
              if (this.entries.has(skill.skillName)) {
                reject(
                  new TypeError(`Duplciate skill name ${skill.skillName}`)
                );
              } else {
                this.entries.set(skill.skillName, skill);
                resolve(skill.skillName);
              }
            } else {
              reject(new TypeError(`Invalid skill name`));
            }
          });
        },
        update: (id, value) => {
          return new Promise( (resolve, _reject) => {
            if (this.entries.has(id)) {
              this.entries.set(id, value);
              resolve(true);
            } else {
              resolve(false);
            }
          })
        }
      },
      [
        ["create", [{ skillName: "Communication" }], true],
        ["keys", [], ["Battle", "Discipline", "Communication"]],
        ["update", ["Communication", {skillName: "Move"}], true],
        ["keys", [], ["Battle", "Discipline", "Move"]],
        ["keyOfValue", [{skillName: "Move"}], "Move"]
      ],
      "Dune Skills container with create and update"
    ],
  ];
  validDataSourceConstructions.forEach(
    ([tested, validOperations = [], testName = null], index) => {
      it(`Testing ${testName || `Test #${index}`}`, async () => {
        let result;
        expect(() => (result = new DataSource(tested))).to.not.throw();
        expect(result.keys()).eventually.not.empty;
        expect(
          result.keys().then((keys) => {
            return Promise.all(keys.map((key) => result.retieve(key)));
          })
        ).eventually.fulfilled;

        validOperations.forEach(([operation, params, expected]) => {
          expect(result[operation](...params)).eventually.equal(expected);
        });
      });
    }
  );
});
