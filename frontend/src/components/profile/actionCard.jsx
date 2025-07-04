import React from "react";
import { RefreshCcw, Trash2Icon } from "lucide-react";

const ActionCard = () => {
  return (
    <div className="rounded-lg border bg-neutral shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Account Actions
        </h3>
      </div>
      <div className="p-6 pt-0 space-y-3">
        <button className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-base-100 h-10 px-4 py-2 w-full flex items-center space-x-2">
          <RefreshCcw  className="text-orange-700"/>
          <span>Reset Interests</span>
        </button>
        <button className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-base-100 h-10 px-4 py-2 w-full flex items-center space-x-2">
          <Trash2Icon className="text-red-500"/>
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
};

export default ActionCard;
