import { ConnectionState } from "../../App";

type ConnectionIndicatorProps = {
  connectionState: ConnectionState;
};

const ConnectionIndicator = ({ connectionState }: ConnectionIndicatorProps) => (
  <span
    className={`absolute left-1 top-1 w-1 h-1 rounded-full ${
      connectionState === "connected"
        ? "bg-green-600 animate-pulse "
        : "bg-red-600"
    }`}
  ></span>
);

export default ConnectionIndicator;
