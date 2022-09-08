import { OBSConnection } from "../App";
import { ID } from "../types";
import ConnectionIndicator from "./ui/ConnectionIndicator";
import Tab from "./ui/Tab";

type NavbarProps = {
  connections: Record<ID, OBSConnection>;
  activeTab: ID | undefined;
  onClickTab: (id: ID) => void;
  onClickNewTab: () => void;
  onClickCloseTab: (id: ID) => void;
};

const Navbar = ({
  connections,
  activeTab,
  onClickTab,
  onClickNewTab,
  onClickCloseTab,
}: NavbarProps) => (
  <ul className="flex flex-wrap">
    {Object.values(connections).map(
      ({ id, credentials: { address }, connectionState }, i) => (
        <li key={id} className="mr-2 mb-2" onClick={() => onClickTab(id)}>
          <Tab isActive={id === activeTab}>
            <ConnectionIndicator connectionState={connectionState} />
            {address}
            <button
              className="ml-1 bg-slate-700 px-2 rounded-full hover:bg-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClickCloseTab(id);
              }}
            >
              X
            </button>
          </Tab>
        </li>
      )
    )}
    <li className="mr-2" onClick={onClickNewTab}>
      <Tab>+</Tab>
    </li>
  </ul>
);

export default Navbar;
