import ObsWebSocket from "obs-websocket-js";
import { mustFind } from "./utils";

export type ObsState = {
  scenes: ObsWebSocket.Scene[];
  currentSceneName: string;
};

export type ConnectionState =
  | {
      kind: "loggingIn";
      errorMessage?: string;
    }
  | {
      kind: "connected";
      obsState: ObsState;
    };

export type Action =
  | {
      kind: "setConnectionState";
      payload: {
        state: ConnectionState;
      };
    }
  | {
      kind: "setCurrentSceneName";
      payload: {
        name: string;
      };
    }
  | {
      kind: "setSourceMuteState";
      payload: {
        sourceName: string;
        muted: boolean;
      };
    }
  | {
      kind: "setSourceVisibilty";
      payload: {
        sceneName: string;
        sourceName: string;
        visible: boolean;
      };
    };

export const reducer = (
  draft: ConnectionState,
  action: Action
): ConnectionState => {
  if (action.kind === "setConnectionState") {
    return action.payload.state;
  }
  if (draft.kind !== "connected") {
    return draft;
  }
  const state = draft.obsState;
  switch (action.kind) {
    case "setCurrentSceneName":
      state.currentSceneName = action.payload.name;
      break;
    case "setSourceMuteState":
      for (const scene of state.scenes) {
        const source = scene.sources.find(
          (source) => source.name === action.payload.sourceName
        );
        if (!source) {
          continue;
        }
        source.muted = action.payload.muted;
      }
      break;
    case "setSourceVisibilty":
      const source = mustFind(
        mustFind(
          state.scenes,
          (scene) => scene.name === action.payload.sceneName
        ).sources,
        (source) => source.name === action.payload.sourceName
      );
      source.render = action.payload.visible;
      break;
  }
  return draft;
};
