import OBSWebSocket from "obs-websocket-js";

export const getKeys = <T>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[];
export const deepCopy = <T>(obj: T): T => structuredClone(obj) as T;

export const connectToObs = async (
  address: string,
  password: string
): Promise<OBSWebSocket> => {
  const obs = new OBSWebSocket();
  try {
    const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
      address,
      password
    );
    console.info(
      `OBS Client connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
    );
    return obs;
  } catch (error: any) {
    console.error(
      `Failed to connect. Error code: ${error.code}. Error mesaage: ${error.message}`
    );
    throw error;
  }
};
