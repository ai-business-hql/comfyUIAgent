import React, { useRef, useState } from "react";
import { DRAWER_Z_INDEX } from "./const";
const WorkflowChat = React.lazy(() => import("./workflowChat/workflowChat"));

export default function App() {
  const workspaceContainerRef = useRef(null);
  const [showChat, setShowChat] = useState(false);

  return (
    <div ref={workspaceContainerRef}>
      <div className="absolute top-0 right-0" style={{ zIndex: DRAWER_Z_INDEX }}>
        <button 
          onClick={() => setShowChat(true)}
          className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-black hover:bg-green-600 transition-colors"
        >
          show chat
        </button>
        {showChat && <WorkflowChat onClose={() => setShowChat(false)} />}
      </div>
    </div>
  );
}
