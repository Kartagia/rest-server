import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { UnsupportedError } from "@/errors.mjs";
import ActionButton from "@/components/actionbutton";
import ServerConfig from "@/components/serverconfig";
import { RestService } from "@/restservice.mjs";

/**
 * Create a new service log component.
 * @param {RestService} service The service whose log is outputted.
 * @returns {import('react').JSXElementConstructor} The service log constructor.
 */
export function ServiceLog({ service }) {
  return (
    <section>
      <header>Actions</header>
      <main>
        {service &&
          service.log.map(
            (/**  @type {import("@/datasource.mjs").LogEntry} */ entry) => {
              return (
                <article>
                  <header>{entry.title}</header>
                  <main>
                    <header>{entry.time}</header>
                    <main>{entry.message}</main>
                  </main>
                </article>
              );
            }
          )}
      </main>
    </section>
  );
}

/**
 * A listener listening server status change.
 * @callback ServerStatusChangeListener
 * @param {string} newState The new state of the service.
 */

/**
 * The properties of the server status.
 * @typedef {Object} ServerStatusProps
 * @property {string} serverName THe server name.
 * @property {number} serverPort The server port.
 * @property {ServerStatusChangeListener} [reportChange] The server change listener.
 * Defaults to listener ignoring all events.
 * @property {RestService|null} [service] The service, whose status is displayed.
 */

/**
 * Create server status component.
 * @param {ServerStatusProps} param0
 * @returns {import("react").JSXElementConstructor} The react component.
 */
export function ServerStatus({
  serverName,
  serverPort,
  reportChange: reportChange = () => {},
  service = null,
}) {
  "use client"
  return (
    <section>
      <header>
        {[
          ["Server Name", serverName],
          ["Port", serverPort],
        ].map(([caption, value]) => {
          return (
            <article className={"status"}>
              <header>{caption}</header>
              <main>{value}</main>
            </article>
          );
        })}
      </header>
      <main>
        <ServiceLog service={service} />
      </main>
      <footer className={"buttons"}>
        <article>
          <ActionButton
            value="stop"
            onClick={() => {
              reportChange("stop");
            }}
            caption="Stop"
          />
        </article>
        <article>
          <ActionButton
            value="start"
            onClick={() => {
              reportChange("start");
            }}
            caption="Start"
          />
        </article>
        <article>
          <ActionButton
            value="restart"
            onClick={() => {
              reportChange("restart");
            }}
            caption="Restart"
          />
        </article>
      </footer>
    </section>
  );
}

/**
 * Create the server component of the application home.
 * @returns {import('react').JSXElementConstructor'}
 */
export default function Home() {
  /** @type {string} */
  let mode = "config";
  const setMode = (newValue) => {
    if (newValue instanceof Function) {
      mode = newValue(mode);
    } else {
      mode = newValue;
    }
  };
  /**
   * The current service name.
   * @type {string|null} */
  let serverName = null;
  /**
   * Setter of the value of the server name.
   * @param {string|null|Transformer<string|null>} newValue The new value of the
   * service name, or the function returning the new value when called
   * with current value.
   */
  const setServerName = (newValue) => {
    if (newValue instanceof Function) {
      serverName = newValue(serverName);
    } else {
      serverName = newValue;
    }
  };
  /**
   * The server port.
   * @type {number} */
  let serverPort = 0;
  /**
   * Setter of the value of the server port.
   * @param {number|Transformer<number>} newValue The new value of the
   * port, or the function returning the new value when called with current value.
   */
  const setServerPort = (newValue) => {
    if (newValue instanceof Function) {
      serverPort = newValue(serverPort);
    } else {
      serverPort = newValue;
    }
  };
  /**
   * @type {(RestService|null)}
   */
  let service = null;

  /**
   * Setter of the value of the service.
   * @param {RestService|null|Transformer<RestService|null>} newValue The new value of the
   * service, or the function returning the new value when called with current value.
   */
  const setService = (newValue) => {
    if (newValue == null) {
      service = null;
    } else if (newValue instanceof RestService) {
      service = newValue;
    } else if (newValue instanceof Function) {
      service = newValue(service);
    } else {
      throw TypeError("invalid new service! Not a service!");
    }
  };

  /**
   * The method dealing with configuration changes.
   * @param {SubmitEvent} event The submission event.
   */
  function handleConfigurationChange(event) {
    // Check the incoming data.
    if (event.currentTarget.serverName.value) {
      // TODO: add checking of the value.
      setServerName(event.currentTarget.serverName.value);
    }
    setServerPort(Number.parseInt(event.currentTarget.serverPort.value));

    // Setting the mode.
    setMode("start");

    // Starting the service.
    const newService = {
      logs() {
        return [];
      },
    };
    setService(newService);
  }

  /**
   * Handle server chage.
   * @param {string} action The action of the server change.
   */
  function handleServerChange(action) {
    switch (action) {
      case "stop":
        setMode("config");
        break;
      case "start":
        setMode("running");
        break;
      case "restart":
        setMode("resteart");
        break;
      default:
        console.error("Unknown action");
    }
  }

  const content =
    mode === "config" ? (
      <ServerConfig onChange={handleConfigurationChange} />
    ) : (
      <ServerStatus
        reportChange={handleServerChange}
        serverName={serverName}
        serverPort={serverPort}
        service={service}
      />
    );
  const context = service ? (
    <ServiceContext value={service}>{content}</ServiceContext>
  ) : (
    content
  );

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1>Rest Server Control Panel</h1>
        {context ? context : content}
        <ServerConfig onChange={handleConfigurationChange}></ServerConfig>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>src/app/page.js</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className={styles.grid}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore starter templates for Next.js.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
