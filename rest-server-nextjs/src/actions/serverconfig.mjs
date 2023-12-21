'use server'

import { createPathSegmentRegexp } from "../path.mjs";
import { RestService } from "@/restservice.mjs";
import { ZodSchema, z } from 'zod';

/**
 * @module actions/ServerConfig
 * 
 * Actions related to the {@link import("@/app/admin/serverconfig").ServerCOnfig} component.
 */

/**
 * The mock server database.
 */
const servers = new Map();

/**
 * @type {number} The next server id.
 */
const firstServerId = Math.floor(Math.random()*10000)+1;
/**
 * @type {number} The next server id.
 */
var serverId = firstServerId;
/**
 * @type {number} The first server id which is not valid.
 */
const serverIdCount = 100000;
/**
 * The interval between numbers.
 * @type {number}
 */
const serverInterval = Math.floor(Math.random()*100)*3+3;

/**
 * Generate next server identifier.
 * @returns {number|string} The next server identifier.
 */
function createServerId() {
  // REplace this with proper has generation.
  const result = serverId;
  serverId = (serverId + serverInterval) % serverIdCount;
  return result;
}

/**
 * @typedef {Object} State The state of the result.
 * @property { false } [success] Is the state success or not.
 * @property { string } message The message of the state.
 * @property {()->string} toString The method converting the state into string.
 */

/**
 * The reply indicating failure.
 * @typedef {Object} ActionErrorReply
 * @property {Object.<string, State} errors The errors of the handling.
 */

/**
 * The reply of a successful creation action.
 * @typedef {Object} ActionCreatedReply
 * @property {string} id The identifier of the created entry.
 * @property {string} message The message of the created result.
 */

/**
 * The reply of a failed action.
 * @typedef {Object} ActionFailureReply
 * @property {false} result The result of the action.
 * @property {string} message The message of the failure.
 */

/**
 * The reply of a successful action.
 * @typedef {Object} ActionSuccessReply
 * @property {true} result The result of the action.
 * @property {string} message The message of the success
 */


/**
 * Th eaction reply types.
 * @typedef {ActionErrorReply|ActionCreatedReply|ActionSuccessReply|ActionFailureReply} ActionReply
 */

const pathSegmentRegex = createPathSegmentRegexp("param");

const pathSegmentSchema = z.string()
.regex(pathSegmentRegex);

/**
 * ZOD Schema for path.
 */
const pathSchema = z.object({
  isAbsolute: z.boolean().default(false),
  segments: z.array(pathSegmentSchema.shape)
})

const retrieveFunctionSchema = z.function();

/**
 * @template Key, Value
 * @typedef {import("@/datasource.mjs").IDataSource<Key,Value>} IDataSource
 */

/**
 * Create data source schema
 * @template [Key=any], [Value=any]
 * @param {ZodSchema<Key>} keySchema The key scheam.
 * @param {ZodSchema<Value>} valueSchema The value schema.
 * @returns {ZodSchema<IDataSource<Key, Value>>}
 */
function createDataSourceSchema(keySchema, valueSchema) {
  return z.object({
    path: z.string().url().or(z.object(pathSchema.shape)),
    retrieve: z.function(retrieveFunctionSchema),
    keys: z.function(z.void(), z.promise(z.array(keySchema))),
    create: z.function().args(z.valueSchema).returns(z.promise(z.keySchema)).optional(),
    update: z.function().args(keySchema, valueSchema).returns(z.promise(z.boolean)).optional(),
    remove: z.function().args(keySchema).returns(z.promise(z.boolean)).optional(),
    filterByKey: z.function().args(z.function(keySchema, z.boolean())).returns(z.promise(z.array(valueSchema))).optional(),
    filterByValue: z.function().args(z.function(valueSchema)).returns(z.promise(z.array(valueSchema))).optional(),
    keyOfValue: z.function().optional()
  })
}

/**
 * Data source form validating ZOD Schema.
 * @template Key  The key type of the data source.
 * @template Value The value type of the data source.
 * @type {z.ZodObject<z.ZodTypeDef<IDataSource>>}
 */
const dataSourceSchema = z.object({
  path: z.string().url().or(z.object(pathSchema.shape)),
  retrieve: z.function(retrieveFunctionSchema),
  keys: z.function(z.void(), z.promise(z.array(/**@type {ZodType<Key>} */z.any()))),
  create: z.function().optional(),
  update: z.function().optional(),
  remove: z.function().optional(),
  filterByKey: z.function().optional(),
  filterByValue: z.function().optional(),
  keyOfValue: z.function().optional()
})

const sqlDataSourceSchema = dataSourceSchema.extends({
  url: z.string().url(),
  retrieveStmt: z.string(),
  keysStmt: z.string(),
  createStmt: z.string().optional(),
  updateStmt: z.string().optional(),
  removeStmt: z.string().optional(),
  filterByKeyStmt: z.string().optional(),
  filterByValueStmt: z.string().optional(),
  keyOfValueStmt: z.string().optional(),
})

/**
 * Service form validating ZOD Schema.
 * - The data sources are either data source schemas,
 * or strings referring to data sources.
 */
const serviceSchema = z.object({
  serviceName: z.string(),
  port: z.number().int().gte(0),
  path: z.object(pathSchema.shape).optional(),
  dataSources: z.union(z.array(dataSourceSchema.shape),z.array(z.string())).optional()
});

/**
 * Test validity of the service form data.
 * @param {FormData} formData 
 */
function validService(formData) {
  
}

/**
 * Create a new server.
 * @param {FormData} formData The form data containing the created server.
 * @returns {ActionErrorReply|ActionCreatedReply|ActionFailureReply} The reply of the cration action.
 */
export async function createServer(formData) {
  // TODO: Create ZOD
  if (formData.get("serverName")) {

  }

  // Mutate data:
  const server = new RestService({serverName: formData.get("serverName"),
    port: Number.parseInt(formData.get("serverPort"))});

  if ([...(servers.values())].find( (s) => (s.port === server.port))) {
    // The port is reserved.
    return {
      errors: {"serverPort": "Server port not available"}
    }
  }

  // Setting the server.
  const newId = createServerId();
  servers.set(newId, server);

  // Returning result.
  return {
    id: newId,
    message: "Server created"
  };
}

export async function updateServer(serverId, formData) {

}

export async function retrieveServer(serverId) {

}

export async function removeServer(serverId) {

}
