
import SectionHeader from "@/component/sectionHeader.js";

/**
 * The comparison result.
 * <dl>
 *   <dt>Negative number</dt><dd>The Compared is less than the comparee.</dd>
 *   <dt>Zero</dt><dd>The compared is equal to the comparee.</dd>
 *   <dt>Positive number</dt><dd>The Compared is greater than the comparee.</dd>
 *   <dt>Undefined valeu</dt><dd>The comparison was not possible.</dd>
 * </dl>
 * @typedef {number} ComparisonResult
 */

/**
 * Comparator function compares two values. 
 * @template [TYPE=any] The compared type.
 * @callback ComparatorFunction
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value compared to.
 * @returns {ComparisonResult} The result of the comparison.
 */

/**
 * The properties for the data source list.
 * @typedef {Object} DataSourceListProps
 * @property {import("react").ReactElement|string} [title] The title of the list.
 * @property {Parameters} parameters THe data source list parameters.
 * @property {FilterTypes} [filter] The filter used to reduce the listed data sources.
 * @property {ComparatorFunction<import("@/datasource.mjs").IDataSource>} [order] The comparison
 * funciton determing the order of the data sources.
 */

async function fetchDataSources() {
  "use client"
  const [] = use
}

/**
 * Create a data source list component.
 * @param {DataSourceListProps} param0 The properties of the data source list React component.
 */
export function DataSourceList({parameters, title=null, filter=null, order=null, ...props}) {
  "use client"

  const className = "DataSourceList";
  const dataSources = (props.entries || fetchDataSources())

  return (<><section className={className}>
    <header className={className}>{title}</header>
    <main className={className}>
      {dataSources.map( (dataSource) => {

      })}
    </main>
    <footer className={className}></footer>
  </section></>);
}

/**
 * Create the rest service page handling rest service calls.
 */
export default function RestServicePage() {

  return(
    <DataSourceList>
    </DataSourceList>
  );
}