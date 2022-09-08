import OBSWebSocket from "obs-websocket-js";
import { useEffect, useState } from "react";

type Scene = {
  sceneName: string;
};

type SceneItem = {
  inputKind: string;
  sourceName: string;
  sceneItemId: number;
  sceneItemEnabled: boolean;
};

type ControlObsPanelProps = {
  obs: OBSWebSocket;
  onClickDisconnect: () => void;
};

const ControlObsPanel = ({ obs, onClickDisconnect }: ControlObsPanelProps) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentProgramSceneName, setCurrentProgramSceneName] =
    useState<string>("");
  const [sceneItems, setSceneItems] = useState<SceneItem[]>([]);

  const onClickSceneName = async (name: string) => {
    await obs.call("SetCurrentProgramScene", { sceneName: name });
    const { sceneItems } = await obs.call("GetSceneItemList", {
      sceneName: name,
    });
    setCurrentProgramSceneName(name);
    setSceneItems(sceneItems as SceneItem[]);
  };

  useEffect(() => {
    if (obs === undefined) {
      return;
    }
    (async () => {
      const { scenes, currentProgramSceneName } = await obs.call(
        "GetSceneList"
      );
      const { sceneItems } = await obs.call("GetSceneItemList", {
        sceneName: currentProgramSceneName,
      });
      setScenes(scenes as Scene[]);
      setCurrentProgramSceneName(currentProgramSceneName);
      setSceneItems(sceneItems as SceneItem[]);
    })();
  }, [obs]);

  const onClickToggleSceneItemEnabled = async (source: SceneItem) => {
    await obs.call("SetSceneItemEnabled", {
      sceneName: currentProgramSceneName,
      sceneItemId: source.sceneItemId,
      sceneItemEnabled: !source.sceneItemEnabled,
    });
    setSceneItems(
      sceneItems.map((s) =>
        s.sceneItemId === source.sceneItemId
          ? { ...s, sceneItemEnabled: !source.sceneItemEnabled }
          : s
      )
    );
  };

  const refreshBrowserSource = (inputName: string) => {
    obs.call("PressInputPropertiesButton", {
      inputName,
      propertyName: "refreshnocache",
    });
  };

  return (
    <div>
      <button
        className="px-4 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700"
        onClick={onClickDisconnect}
      >
        Disconnect
      </button>

      <div>
        <h1 className="text-xl text-slate-300 my-2">
          {currentProgramSceneName}
        </h1>
        {scenes.map((scene) => (
          <button
            key={scene.sceneName}
            className="block my-4 w-52 px-4 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => onClickSceneName(scene.sceneName)}
          >
            {scene.sceneName}
          </button>
        ))}
      </div>
      <div className="text-sm font-medium text-slate-400 ">
        {[...sceneItems].reverse().map((source) => (
          <label key={source.sourceName}>
            <span className="block my-2">{source.sourceName}</span>
            <button
              className="group mr-4"
              onClick={() => onClickToggleSceneItemEnabled(source)}
            >
              <span
                className={`w-8 h-8 inline-block ${
                  source.sceneItemEnabled ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
            </button>
            {source.inputKind === "browser_source" && (
              <button
                className="group mr-4"
                onClick={() => refreshBrowserSource(source.sourceName)}
              >
                Reload
              </button>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ControlObsPanel;
