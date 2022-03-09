import { useEffect, useRef } from "react";
import ObsWebSocket from "obs-websocket-js";
import { useImmerReducer } from "use-immer";
import { ConnectionState, reducer } from "./reducer";
import Login from "./components/Login";
import Connected from "./components/Connected";

function App() {
  const obs = useRef(new ObsWebSocket());

  const [connectionState, dispatch] = useImmerReducer(reducer, {
    kind: "loggingIn",
  } as ConnectionState);

  useEffect(() => {
    obs.current.on("SwitchScenes", ({ "scene-name": name }) => {
      dispatch({
        kind: "setCurrentSceneName",
        payload: { name },
      });
    });
    obs.current.on("SourceMuteStateChanged", ({ sourceName, muted }) => {
      dispatch({
        kind: "setSourceMuteState",
        payload: { sourceName, muted },
      });
    });
    obs.current.on(
      "SceneItemVisibilityChanged",
      ({
        "scene-name": sceneName,
        "item-name": itemName,
        "item-visible": visible,
      }) => {
        dispatch({
          kind: "setSourceVisibilty",
          payload: { sceneName, sourceName: itemName, visible },
        });
      }
    );
  }, []);

  return (
    <div className="p-5">
      {connectionState.kind === "connected" ? (
        <Connected
          state={connectionState.obsState}
          obs={obs}
          dispatch={dispatch}
        />
      ) : (
        <Login
          errorMessage={connectionState.errorMessage}
          obs={obs}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

export default App;
