import useLocalStorage from "./hooks/useLocalStorage";
import { ID, newID } from "./types";
import { connectToObs, deepCopy, getKeys } from "./utils";
import LoginPanel from "./components/LoginPanel";
import OBSWebSocket from "obs-websocket-js";
import { useEffect, useRef, useState } from "react";
import ControlObsPanel from "./components/ControlObsPanel";
import Navbar from "./components/Navbar";

type LoginCredentials = {
  address: string;
  password: string;
};

export type ConnectionState = "disconnected" | "connected";

export type OBSConnection = {
  id: ID;
  credentials: LoginCredentials;
  connectionState: ConnectionState;
};

const DEFAULT_CREDENTIALS = { address: "ws://localhost:4455", password: "" };

const newConnection = (id: ID): OBSConnection => ({
  id,
  credentials: DEFAULT_CREDENTIALS,
  connectionState: "disconnected",
});

function App() {
  const [connections, setConnections] = useLocalStorage<
    Record<ID, OBSConnection>
  >("connections", null);
  const [activeTab, setActiveTab] = useLocalStorage<ID>("activeTab", null);
  const [afterInit, setAfterInit] = useState(false);
  const obsClients = useRef<Record<ID, OBSWebSocket>>({});

  useEffect(() => {
    if (!connections || afterInit) {
      return;
    }
    for (const connection of Object.values(connections)) {
      if (connection.connectionState === "connected") {
        connectToObs(
          connection.credentials.address,
          connection.credentials.password
        ).then((obs) => addConnectedObs(connection.id, obs));
      }
    }
    setAfterInit(true);
  }, [connections]);

  useEffect(() => {
    if (connections && Object.keys(connections).length === 0) {
      addNewConnectionTab();
    }
  }, [connections]);

  const addNewConnectionTab = () => {
    const id = newID();
    setConnections({ ...connections, [id]: newConnection(id) });
    setActiveTab(id);
  };

  const removeConnectionTab = (id: ID) => {
    if (!connections) {
      return;
    }
    const newConnections = deepCopy(connections);
    delete newConnections[id];
    setConnections(newConnections);
    if (activeTab === id) {
      setActiveTab(getKeys(newConnections)[0]);
    }
    const obs = obsClients.current[id];
    if (obs) {
      delete obsClients.current[id];
      obs
        .disconnect()
        .then(() => console.info(`OBS Client disconnected: ${id}`));
    }
  };

  const onChangeAddress = (address: string) => {
    if (!connections || !activeTab) {
      return;
    }
    const newConnections = deepCopy(connections);
    newConnections[activeTab].credentials.address = address;
    setConnections(newConnections);
  };

  const onChangePassword = (password: string) => {
    if (!connections || !activeTab) {
      return;
    }
    const newConnections = deepCopy(connections);
    newConnections[activeTab].credentials.password = password;
    setConnections(newConnections);
  };

  const addConnectedObs = (id: ID, obs: OBSWebSocket) => {
    if (!connections) {
      return;
    }
    obsClients.current[id] = obs;
    const newConnections = deepCopy(connections);
    newConnections[id].connectionState = "connected";
    setConnections(newConnections);
    console.info(`OBS Client fully connected: ${id}`);
  };

  const disconnectObs = (id: ID) => {
    if (!connections) {
      return;
    }
    const obs = obsClients.current[id];
    if (obs) {
      delete obsClients.current[id];
      obs
        .disconnect()
        .then(() => console.info(`OBS Client disconnected: ${id}`));
    }
    const newConnections = deepCopy(connections);
    newConnections[id].connectionState = "disconnected";
    setConnections(newConnections);
  };

  return (
    <div className="p-5">
      <Navbar
        connections={connections ?? {}}
        activeTab={activeTab ?? undefined}
        onClickTab={setActiveTab}
        onClickNewTab={addNewConnectionTab}
        onClickCloseTab={removeConnectionTab}
      />
      {connections &&
        activeTab &&
        connections[activeTab] &&
        (connections[activeTab].connectionState === "connected" ? (
          <ControlObsPanel
            obs={obsClients.current[activeTab]}
            onClickDisconnect={() => disconnectObs(activeTab)}
          />
        ) : (
          <LoginPanel
            address={connections[activeTab].credentials.address}
            password={connections[activeTab].credentials.password}
            onChangeAddress={onChangeAddress}
            onChangePassword={onChangePassword}
            onConnect={(obs) => addConnectedObs(activeTab, obs)}
          />
        ))}
    </div>
  );
}

export default App;
