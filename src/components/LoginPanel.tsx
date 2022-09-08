import OBSWebSocket from "obs-websocket-js";
import { useState } from "react";
import { connectToObs } from "../utils";

type LoginProps = {
  address: string;
  password: string;
  onChangeAddress: (address: string) => void;
  onChangePassword: (password: string) => void;
  onConnect: (obs: OBSWebSocket) => void;
};

const LoginPanel = ({
  address,
  password,
  onChangeAddress,
  onChangePassword,
  onConnect,
}: LoginProps) => {
  const [error, setError] = useState<string>();

  const onClickConnect = () => {
    connectToObs(address, password)
      .then(onConnect)
      .catch((error) => {
        setError(`Failed to connect: ${error.message}`);
      });
  };

  return (
    <div>
      {error && (
        <span className="block text-sm font-medium text-red-700">{error}</span>
      )}
      <label>
        <span className="block my-2 text-sm font-medium text-slate-700  mr-1">
          Address
        </span>
        <input
          className="peer p-1 border-2 rounded-lg mr-2"
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
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
          onChange={(e) => onChangePassword(e.target.value)}
        />
      </label>
      <button
        className="block my-4 px-4 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        onClick={onClickConnect}
      >
        Connect
      </button>
    </div>
  );
};

export default LoginPanel;
