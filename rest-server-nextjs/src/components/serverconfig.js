'use client'
import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { useId, useState } from "react";
import { createServer, updateServer } from '@/actions/serverconfig.mjs';

const initialState = {
  message: null,
}

/**
 * Create server configuration component.
 * @param {import('react').PropsWithoutRef} props The component properties.
 * @returns {import('react').ReactElement} React component of the server configuration.
 */
export default function ServerConfig(props) {
  const [state, formAction] = useFormState((props.serverId ? updateServer : createServer),
  initialState);
  const cancelCaption = props.cancelCaption || "Close";
  const submitCaption = props.submitCaption || "Save";
  const serviceName = useId();
  const servicePort = useId();
  const dataSource = useId();

  return (
    <section>
      <form action={formAction}>
        <header>
          <h1>{props.title}</h1>
        </header>
        <main>
          <article>
            <label htmlFor={serviceName}>Service Name</label>
            <input name="serviceName" id={serviceName} />
            <div hidden={state.errors?.["serviceName"] != null}>
              {state.errors["serviceName"]}
            </div>
          </article>
          <article>
            <label htmlFor={servicePort}>Service Port</label>
            <input type="number" name="servicePort" id={servicePort} />
            <div hidden={state?.errors?.["servicePort"] != null}>
              {errors["servicePort"]}
            </div>
          </article>
          <article>
            <label htmlFor={dataSource}></label>
            <input name="dataSource" id={dataSource} />
            <div hidden={state?.errors?.["dataSource"] != null}>
              {state.errors["dataSource"]}
            </div>
          </article>
        </main>
        <footer>
          <article className={"buttons"}>
            <input type="submit" name="submit" value={submitCaption}></input>
            <input type="submit" name="default" value={cancelCaption}></input>
            <p hidden={state?.message == null}>{state?.message}</p>
          </article>
        </footer>
      </form>
    </section>
  );
}
