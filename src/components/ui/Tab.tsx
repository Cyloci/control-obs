import React from "react";

type TabProps = {
  isActive?: boolean;
  children?: React.ReactNode;
};

const Tab = ({ isActive, children }: TabProps) => {
  return (
    <div
      className={`relative inline-block py-2 px-4 rounded-lg cursor-pointer text-sm font-medium text-center ${
        isActive
          ? "text-white bg-blue-900"
          : "text-gray-400 bg-gray-800 hover:bg-gray-700"
      }`}
      aria-current="page"
    >
      {children}
    </div>
  );
};

export default Tab;
