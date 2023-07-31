
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import {
  AzureClient,
  AzureRemoteConnectionConfig,
  ITelemetryBaseEvent,
  ITelemetryBaseLogger,
} from "@fluidframework/azure-client";
import { IFluidContainer } from "@fluidframework/fluid-static";
import { ConnectionState } from "@fluidframework/container-loader";
import { SignalManager as Signaler } from "@fluid-experimental/data-objects";


export function getClient(
  userId,
  mode,
  logger
) {
  console.log(`fluid mode is ${mode}`);
  switch (mode) {
    case "frs":
      const remoteConnectionConfig = {
        type: "remote",
        tenantId: process.env.SECRET_FLUID_TENANT,
        tokenProvider: new InsecureTokenProvider(
          process.env.SECRET_FLUID_TOKEN,
          {
            id: userId,
            name: userId,
          }
        ),
        endpoint: process.env.SECRET_FLUID_RELAY,
      };
      console.log(`Connecting to ${process.env.SECRET_FLUID_RELAY}`);
      return new AzureClient({
        connection: remoteConnectionConfig,
        logger,
      });
    case "router": //guesswork, untested
      const routerConnectionConfig = {
        type: "remote",
        tenantId: "fluid",
        tokenProvider: new InsecureTokenProvider(
          "create-new-tenants-if-going-to-production",
          { id: userId, name: userId }
        ),
        endpoint: "http://localhost:3003",
      };
      console.log(`Connecting to ${routerConnectionConfig.endpoint}`);
      return new AzureClient({
        connection: routerConnectionConfig,
        logger,
      });
    default:
      console.log(`Connecting to http://localhost:7070`);
      return new AzureClient({
        connection: {
          type: "local",
          tokenProvider: new InsecureTokenProvider("", {
            id: userId,
            name: userId,
          }),
          endpoint: "http://localhost:7070",
        },
        logger,
      });
  }
}


export async function createSimpleWorkspace(
  containerId,
  mode,
  logger = undefined
) {
  const createNew = containerId === undefined;
  const containerSchema = {
    initialObjects: { signaler: Signaler },
  };
  const client = getClient("benchmark", mode, logger);
  let containerAndServices;
  if (createNew) {
    containerAndServices = await client.createContainer(containerSchema);
    containerId = await containerAndServices.container.attach();
  } else {
    containerAndServices = await client.getContainer(
      containerId,
      containerSchema
    );
    await waitForFullyLoaded(containerAndServices.container);
  }
  const signaler = containerAndServices.container.initialObjects
    .signaler;
  return {
    containerId: containerId,
    container: containerAndServices.container,
    signaler: signaler,
    dispose: () => {
      containerAndServices.container.dispose();
    },
  };
}

async function waitForFullyLoaded(container) {
  if (container.connectionState !== ConnectionState.Connected) {
    await new Promise((resolve) => {
      container.once("connected", resolve);
    });
  }
}
