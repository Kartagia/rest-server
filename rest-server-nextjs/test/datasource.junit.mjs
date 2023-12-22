
import { DataSource } from "../src/datasource.mjs";

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
 * @param {Logger} [logger] The logger used to log the messages. Defaults
 * to console.log.
 */
export function testCreateDataSource(logger=console.log) {
  try {
    const tested = new DataSource();
  } catch(error) {
    throw Error("Test failed on DataSource", {cause: error});
  }
}


// Running the tests.
/**
 * 
 * @param {Logger} [logger] The logger used to log the messages. Defaults
 * to console.log.
 */
export default function runTests(logger=console.log, baseIndex=1) {
  const results = {Failed: 0, Skipped: 0, Passed: 0}
  [["createDataSource", testCreateDataSource]].forEach( ([testName, testFunction], index) => {
  try {
    const testTitle = `Test #${baseIndex + index}: ${testName || ""}:`
    logger.group(testTitle); 
    if (testFunction(logger)) {
      logger.log("Test succeeded");
      results.Passed++;
    } else {
      logger.log("Test skipped");
      results.Skipped++;
    }
  } catch(error) {
    logger.error(`Test Failed: ${error.name || "Error"}: ${error.message}`);
    results.Failed++;
  }
  logger.groupEnd();
});
results.Total = results.Passed + results.Failed + results.Skipped;
return results;
}
/**
 * Performs tests and prints summary.
 * @param {string} [testTitle] The title of the test.
 * @param {Logger} [logger] The logger used to log the messages. Defaults
 * to console.log.
 */
export function testResults(testTitle="DataSource JUNIT Test", logger=console.log) {
  const timerName = `${testTitle} elapsed time`
  loggerGroup(testTitle)
  if ("time" in logger) {
    logger.time(timerName);
  }
  logger.group("Tests");
  const results = runTests(logger);
  if (results.Failed) {
    logger.log(`Test failed (with ${results.Failed} failures, ${results.Skipped} skipped)`);
  } else {
    logger.log(`Test passed (with ${results.Skipped} skipped)`);
  }
  logger.groupEnd();
  logger.group("Summary");
  if ("timeEnd" in logger) {
    logger.timeEnd(timerName);
  }
  logger.table(["Summary", results]);
  logger.groupEnd();
  logger.groupEnd();
}