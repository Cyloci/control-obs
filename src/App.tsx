import { useEffect, useRef, useState } from "react";
import ObsWebSocket from "obs-websocket-js";
import useLocalStorage from "./hooks/useLocalStorage";
import VolumeHighSolid from "./assets/volume-high-solid.svg?component";
import VolumeXMarkSolid from "./assets/volume-xmark-solid.svg?component";

type ConnectionState =
  | {
      kind: "disconnected";
    }
  | {
      kind: "connected";
    }
  | {
      kind: "loginError";
      errorMessage: string;
    };

function App() {
  const obs = useRef(new ObsWebSocket());

  const [address, setAddress] = useLocalStorage("address", "localhost:4444");
  const [password, setPassword] = useLocalStorage("password", "");
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    kind: "disconnected",
  });

  const [scenes, setScenes] = useState<ObsWebSocket.Scene[]>([]);
  const [currentSceneName, setCurrentSceneName] = useState("");
  const currentScene = scenes.find((scene) => scene.name === currentSceneName);

  useEffect(() => {
    obs.current.on("SwitchScenes", ({ "scene-name": name }) => {
      setCurrentSceneName(name);
    });
    obs.current.on("SourceMuteStateChanged", ({ sourceName, muted }) => {
      setScenes((scenes) =>
        scenes.map((scene) => ({
          ...scene,
          sources: scene.sources.map((source) =>
            source.name === sourceName
              ? {
                  ...source,
                  muted,
                }
              : source
          ),
        }))
      );
    });
    obs.current.on(
      "SceneItemVisibilityChanged",
      ({
        "scene-name": sceneName,
        "item-name": itemName,
        "item-visible": visible,
      }) => {
        setScenes((scenes) =>
          scenes.map((scene) =>
            scene.name === sceneName
              ? {
                  ...scene,
                  sources: scene.sources.map((source) =>
                    source.name === itemName
                      ? {
                          ...source,
                          render: visible,
                        }
                      : source
                  ),
                }
              : scene
          )
        );
      }
    );
  }, []);

  const onClickConnect = async () => {
    try {
      await obs.current.connect({
        address,
        password,
      });
      console.info("connected to OBS");
      setConnectionState({ kind: "connected" });
    } catch (error: any) {
      console.error(error);
      setConnectionState({
        kind: "loginError",
        errorMessage: `Logging in failed: ${error.error}`,
      });
      return;
    }
    const { scenes } = await obs.current.send("GetSceneList");
    setScenes(scenes);
    const { name } = await obs.current.send("GetCurrentScene");
    setCurrentSceneName(name);
  };

  const onClickDisconnect = () => {
    obs.current.disconnect();
    console.info("disconnected from OBS");
    setConnectionState({
      kind: "disconnected",
    });
  };

  const onClickSceneName = (name: string) => {
    obs.current.send("SetCurrentScene", { "scene-name": name });
  };

  const toggleSourceMute = (sourceName: string) => {
    obs.current.send("ToggleMute", {
      source: sourceName,
    });
  };

  return (
    <div className="p-5">
      {connectionState.kind === "connected" ? (
        <>
          <button
            className="px-4 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700"
            onClick={onClickDisconnect}
          >
            Disconnect
          </button>
          <div>
            <h1 className="text-xl my-2">{currentScene?.name}</h1>
            {scenes.map((scene) => (
              <button
                key={scene.name}
                className="block my-4 w-52 px-4 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => onClickSceneName(scene.name)}
              >
                {scene.name}
              </button>
            ))}
            {currentScene?.sources
              .filter(
                ({ type }) =>
                  type === "coreaudio_input_capture" ||
                  type === "coreaudio_output_capture"
              )
              .map((source) => (
                <label key={source.name}>
                  <span className="block my-2 text-sm font-medium text-slate-700  mr-1">
                    {source.name}
                  </span>
                  <button
                    className="group text-xl "
                    disabled={!source.render}
                    onClick={() => toggleSourceMute(source.name)}
                  >
                    {source.muted ? (
                      <VolumeXMarkSolid className="w-[20px] text-red-600 group-disabled:text-gray-400 fill-current" />
                    ) : (
                      <VolumeHighSolid className="w-[22px] group-disabled:text-gray-400 fill-current" />
                    )}
                  </button>
                </label>
              ))}
          </div>
        </>
      ) : (
        <>
          {connectionState.kind === "loginError" && (
            <span className="block text-sm font-medium text-red-700">
              {connectionState.errorMessage}
            </span>
          )}
          <label>
            <span className="block my-2 text-sm font-medium text-slate-700  mr-1">
              Address
            </span>
            <input
              className="peer p-1 border-2 rounded-lg mr-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label>
            <span className="block my-2 text-sm font-medium text-slate-700 mr-1">
              Password
            </span>
            <input
              type="password"
              className="peer p-1 border-2 rounded-lg mr-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            className="block my-4 px-4 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            onClick={onClickConnect}
          >
            Connect
          </button>
        </>
      )}
    </div>
  );
}

export default App;
