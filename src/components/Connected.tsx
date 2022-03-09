import { Action, ObsState } from "../reducer";
import VolumeHighSolid from "../assets/volume-high-solid.svg?component";
import VolumeXMarkSolid from "../assets/volume-xmark-solid.svg?component";
import { mustFind } from "../utils";
import ObsWebSocket from "obs-websocket-js";
import { Dispatch, MutableRefObject } from "react";

type ConnectedProps = {
  state: ObsState;
  obs: MutableRefObject<ObsWebSocket>;
  dispatch: Dispatch<Action>;
};

const Connected = ({
  state: { scenes, currentSceneName },
  obs,
  dispatch,
}: ConnectedProps) => {
  const currentScene = mustFind(
    scenes,
    (scene) => scene.name === currentSceneName
  );

  const onClickSceneName = (name: string) => {
    obs.current.send("SetCurrentScene", { "scene-name": name });
  };

  const toggleSourceMute = (sourceName: string) => {
    obs.current.send("ToggleMute", {
      source: sourceName,
    });
  };

  const onClickDisconnect = () => {
    obs.current.disconnect();
    console.info("disconnected from OBS");
    dispatch({
      kind: "setConnectionState",
      payload: {
        state: {
          kind: "loggingIn",
        },
      },
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
        <h1 className="text-xl my-2">{currentScene.name}</h1>
        {scenes.map((scene) => (
          <button
            key={scene.name}
            className="block my-4 w-52 px-4 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => onClickSceneName(scene.name)}
          >
            {scene.name}
          </button>
        ))}
        {currentScene.sources
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
    </div>
  );
};

export default Connected;